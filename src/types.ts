export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'other';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: PaymentMethod | string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number; // percentage (0 - 100)
  transactionCount: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface DailyPoint {
  date: string;
  dayNumber: number;
  dayLabel: string;
  income: number;
  expense: number;
  net: number;
}
