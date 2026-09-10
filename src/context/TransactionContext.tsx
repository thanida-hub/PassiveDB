import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  Transaction,
  TransactionType,
  MonthlySummary,
  CategoryBreakdown,
  DailyPoint,
} from '../types';
import {
  getCurrentMonthKey,
  getMonthDates,
  shiftMonth,
} from '../lib/utils';
import { getCategoryInfo } from '../lib/categories';
import { generateSampleTransactions } from '../data/sampleTransactions';

interface TransactionContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  shiftMonthBy: (delta: number) => void;
  filterType: 'all' | 'income' | 'expense';
  setFilterType: (type: 'all' | 'income' | 'expense') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  monthlySummary: MonthlySummary;
  categoryBreakdown: CategoryBreakdown[];
  incomeCategoryBreakdown: CategoryBreakdown[];
  dailyPoints: DailyPoint[];
  previousMonthSummary: MonthlySummary;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'userId'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  seedSampleData: () => Promise<void>;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Load demo transactions if guest
  useEffect(() => {
    if (!user) {
      const local = localStorage.getItem('passivedb_guest_transactions');
      if (local) {
        try {
          setTransactions(JSON.parse(local));
        } catch {
          const sample = generateSampleTransactions('demo-user').map((item, idx) => ({
            ...item,
            id: `demo-${idx + 1}`,
          }));
          setTransactions(sample);
          localStorage.setItem('passivedb_guest_transactions', JSON.stringify(sample));
        }
      } else {
        const sample = generateSampleTransactions('demo-user').map((item, idx) => ({
          ...item,
          id: `demo-${idx + 1}`,
        }));
        setTransactions(sample);
        localStorage.setItem('passivedb_guest_transactions', JSON.stringify(sample));
      }
      setLoading(false);
      return;
    }

    // User is logged in: Listen to Firestore subcollection /users/{userId}/transactions
    setLoading(true);
    const collectionPath = `users/${user.uid}/transactions`;
    const colRef = collection(db, 'users', user.uid, 'transactions');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: data.userId || user.uid,
            type: data.type || 'expense',
            amount: Number(data.amount) || 0,
            category: data.category || 'อื่นๆ',
            date: data.date || '',
            note: data.note || '',
            paymentMethod: data.paymentMethod || 'cash',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        });

        // Sort descending by date, then createdAt
        items.sort((a, b) => {
          if (b.date !== a.date) return b.date.localeCompare(a.date);
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

        setTransactions(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const shiftMonthBy = (delta: number) => {
    setSelectedMonth((prev) => shiftMonth(prev, delta));
  };

  const addTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const nowISO = new Date().toISOString();
    if (!user) {
      // Local demo mode
      const newTx: Transaction = {
        ...data,
        id: `local-${Date.now()}`,
        userId: 'demo-user',
        createdAt: nowISO,
        updatedAt: nowISO,
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('passivedb_guest_transactions', JSON.stringify(updated));
      return;
    }

    const collectionPath = `users/${user.uid}/transactions`;
    try {
      const colRef = collection(db, 'users', user.uid, 'transactions');
      const payload = {
        userId: user.uid,
        type: data.type,
        amount: Number(data.amount),
        category: data.category.slice(0, 64),
        date: data.date,
        note: (data.note || '').slice(0, 300),
        paymentMethod: (data.paymentMethod || 'cash').slice(0, 32),
        createdAt: nowISO,
        updatedAt: nowISO,
      };
      await addDoc(colRef, payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, collectionPath);
    }
  };

  const updateTransaction = async (
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'userId'>>
  ) => {
    const nowISO = new Date().toISOString();
    if (!user) {
      const updated = transactions.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: nowISO } : t
      );
      setTransactions(updated);
      localStorage.setItem('passivedb_guest_transactions', JSON.stringify(updated));
      return;
    }

    const docPath = `users/${user.uid}/transactions/${id}`;
    try {
      const docRef = doc(db, 'users', user.uid, 'transactions', id);
      const payload: Record<string, any> = {
        updatedAt: nowISO,
      };
      if (data.type !== undefined) payload.type = data.type;
      if (data.amount !== undefined) payload.amount = Number(data.amount);
      if (data.category !== undefined) payload.category = data.category.slice(0, 64);
      if (data.date !== undefined) payload.date = data.date;
      if (data.note !== undefined) payload.note = data.note.slice(0, 300);
      if (data.paymentMethod !== undefined) payload.paymentMethod = data.paymentMethod.slice(0, 32);

      await updateDoc(docRef, payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('passivedb_guest_transactions', JSON.stringify(updated));
      return;
    }

    const docPath = `users/${user.uid}/transactions/${id}`;
    try {
      const docRef = doc(db, 'users', user.uid, 'transactions', id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  const seedSampleData = async () => {
    const samples = generateSampleTransactions(user ? user.uid : 'demo-user');
    for (const item of samples) {
      await addTransaction(item);
    }
  };

  // Month-filtered transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Previous month transactions for comparative insights
  const prevMonthKey = useMemo(() => shiftMonth(selectedMonth, -1), [selectedMonth]);
  const prevMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(prevMonthKey));
  }, [transactions, prevMonthKey]);

  // Monthly summary metrics
  const monthlySummary = useMemo<MonthlySummary>(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    monthTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      transactionCount: monthTransactions.length,
    };
  }, [monthTransactions]);

  // Previous month summary
  const previousMonthSummary = useMemo<MonthlySummary>(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    prevMonthTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      transactionCount: prevMonthTransactions.length,
    };
  }, [prevMonthTransactions]);

  // Category breakdown for expenses
  const categoryBreakdown = useMemo<CategoryBreakdown[]>(() => {
    const map = new Map<string, { amount: number; count: number }>();
    let total = 0;

    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cur = map.get(t.category) || { amount: 0, count: 0 };
        map.set(t.category, {
          amount: cur.amount + t.amount,
          count: cur.count + 1,
        });
        total += t.amount;
      });

    const list: CategoryBreakdown[] = [];
    map.forEach((val, name) => {
      const info = getCategoryInfo(name, 'expense');
      list.push({
        name,
        amount: val.amount,
        count: val.count,
        percentage: total > 0 ? Math.round((val.amount / total) * 100) : 0,
        color: info.color,
        icon: info.icon,
      });
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  // Income category breakdown
  const incomeCategoryBreakdown = useMemo<CategoryBreakdown[]>(() => {
    const map = new Map<string, { amount: number; count: number }>();
    let total = 0;

    monthTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        const cur = map.get(t.category) || { amount: 0, count: 0 };
        map.set(t.category, {
          amount: cur.amount + t.amount,
          count: cur.count + 1,
        });
        total += t.amount;
      });

    const list: CategoryBreakdown[] = [];
    map.forEach((val, name) => {
      const info = getCategoryInfo(name, 'income');
      list.push({
        name,
        amount: val.amount,
        count: val.count,
        percentage: total > 0 ? Math.round((val.amount / total) * 100) : 0,
        color: info.color,
        icon: info.icon,
      });
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  // Daily timeline points for chart
  const dailyPoints = useMemo<DailyPoint[]>(() => {
    const { daysInMonth, year, month } = getMonthDates(selectedMonth);
    const dayMap = new Map<number, { income: number; expense: number }>();

    for (let i = 1; i <= daysInMonth; i++) {
      dayMap.set(i, { income: 0, expense: 0 });
    }

    monthTransactions.forEach((t) => {
      const day = parseInt(t.date.split('-')[2], 10);
      if (dayMap.has(day)) {
        const cur = dayMap.get(day)!;
        if (t.type === 'income') {
          cur.income += t.amount;
        } else {
          cur.expense += t.amount;
        }
      }
    });

    const points: DailyPoint[] = [];
    let cumulativeNet = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dayData = dayMap.get(d) || { income: 0, expense: 0 };
      const net = dayData.income - dayData.expense;
      cumulativeNet += net;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      points.push({
        date: dateStr,
        dayNumber: d,
        dayLabel: `${d}`,
        income: dayData.income,
        expense: dayData.expense,
        net: dayData.income - dayData.expense,
      });
    }

    return points;
  }, [monthTransactions, selectedMonth]);

  // Final filtered list with search and filters
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) {
        return false;
      }
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = (t.note || '').toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        const matchAmount = String(t.amount).includes(q);
        if (!matchNote && !matchCat && !matchAmount) return false;
      }
      return true;
    });
  }, [monthTransactions, filterType, selectedCategory, searchQuery]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        filteredTransactions,
        loading,
        selectedMonth,
        setSelectedMonth,
        shiftMonthBy,
        filterType,
        setFilterType,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        monthlySummary,
        categoryBreakdown,
        incomeCategoryBreakdown,
        dailyPoints,
        previousMonthSummary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        seedSampleData,
        isDemoMode,
        setIsDemoMode,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
