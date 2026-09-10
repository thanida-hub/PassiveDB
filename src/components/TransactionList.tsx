import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  CircleDollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatThaiDate, getTodayDateString } from '../lib/utils';
import { ALL_CATEGORIES, getCategoryInfo } from '../lib/categories';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  onOpenAddModal: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const {
    filteredTransactions,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    deleteTransaction,
    seedSampleData,
    loading,
    selectedMonth,
  } = useTransactions();
  const { user } = useAuth();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteTransaction(id);
      setDeletingId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; items: Transaction[]; dailyIncome: number; dailyExpense: number }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((t) => {
      const arr = dateMap.get(t.date) || [];
      arr.push(t);
      dateMap.set(t.date, arr);
    });

    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach((dateStr) => {
      const items = dateMap.get(dateStr) || [];
      let dailyIncome = 0;
      let dailyExpense = 0;
      items.forEach((item) => {
        if (item.type === 'income') dailyIncome += item.amount;
        else dailyExpense += item.amount;
      });
      groups.push({
        date: dateStr,
        items,
        dailyIncome,
        dailyExpense,
      });
    });

    return groups;
  }, [filteredTransactions]);

  const todayStr = getTodayDateString();

  return (
    <div className="bg-white rounded-3xl border-2 border-purple-100/80 shadow-sm shadow-purple-100/50 overflow-hidden">
      {/* List Header & Controls */}
      <div className="p-5 border-b border-purple-50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
              <span>รายการบันทึก</span>
              <span className="text-xs">📝✨</span>
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/70 shadow-2xs">
              {filteredTransactions.length} รายการ
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {filteredTransactions.length === 0 && (
              <button
                id="seed-sample-btn"
                onClick={() => seedSampleData()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-700 text-xs font-bold transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>โหลดข้อมูลตัวอย่าง ✨</span>
              </button>
            )}
            <button
              id="add-transaction-list-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold shadow-sm shadow-purple-200/80 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>เพิ่มรายการ ✨</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Type Switcher Pills */}
          <div className="flex items-center bg-purple-50/70 p-1 rounded-2xl border border-purple-100 text-xs self-start">
            <button
              id="filter-all-btn"
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                filterType === 'all'
                  ? 'bg-white text-purple-950 shadow-2xs'
                  : 'text-purple-600 hover:text-purple-900'
              }`}
            >
              ทั้งหมด ✨
            </button>
            <button
              id="filter-expense-btn"
              onClick={() => setFilterType('expense')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                filterType === 'expense'
                  ? 'bg-white text-pink-600 shadow-2xs'
                  : 'text-purple-600 hover:text-purple-900'
              }`}
            >
              รายจ่าย 🛍️
            </button>
            <button
              id="filter-income-btn"
              onClick={() => setFilterType('income')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                filterType === 'income'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-purple-600 hover:text-purple-900'
              }`}
            >
              รายรับ 💸
            </button>
          </div>

          {/* Search and Category Filter */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-transactions-input"
                type="text"
                placeholder="ค้นหาบันทึกหรือหมวดหมู่ 🔍..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-purple-50/40 border-2 border-purple-100 rounded-2xl text-xs text-slate-800 placeholder-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>

            {/* Category Dropdown */}
            <select
              id="category-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-purple-50/40 border-2 border-purple-100 rounded-2xl text-xs font-semibold text-purple-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            >
              <option value="all">ทุกหมวดหมู่ 🌸</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.type === 'income' ? 'รับ' : 'จ่าย'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List Body */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            กำลังโหลดข้อมูลจาก Firebase...
          </div>
        ) : groupedTransactions.length > 0 ? (
          groupedTransactions.map((group) => {
            const isToday = group.date === todayStr;
            return (
              <div key={group.date} className="group-date-block">
                {/* Date Header Subtotal */}
                <div className="px-5 py-2.5 bg-slate-50/60 border-y border-violet-50/60 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    <span className="font-semibold text-slate-700">
                      {formatThaiDate(group.date)}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.2 rounded-md bg-violet-100 text-violet-800 text-[10px] font-bold">
                        วันนี้
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-medium text-[11px]">
                    {group.dailyIncome > 0 && (
                      <span className="text-violet-700 font-semibold">
                        รับ +{formatCurrency(group.dailyIncome)}
                      </span>
                    )}
                    {group.dailyExpense > 0 && (
                      <span className="text-rose-600">
                        จ่าย -{formatCurrency(group.dailyExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Transaction Rows */}
                <div className="divide-y divide-slate-50">
                  {group.items.map((item) => {
                    const catInfo = getCategoryInfo(item.category, item.type);
                    const isIncome = item.type === 'income';

                    return (
                      <div
                        key={item.id}
                        id={`transaction-row-${item.id}`}
                        className="px-5 py-3.5 flex items-center justify-between hover:bg-violet-50/20 transition group"
                      >
                        {/* Left: Category Icon & Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: catInfo.color }}
                          >
                            <CategoryIcon iconName={catInfo.icon} size={20} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {item.category}
                              </p>
                              {item.paymentMethod && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  {item.paymentMethod === 'transfer'
                                    ? 'โอนเงิน/QR'
                                    : item.paymentMethod === 'cash'
                                    ? 'เงินสด'
                                    : item.paymentMethod === 'credit_card'
                                    ? 'บัตรเครดิต'
                                    : item.paymentMethod}
                                </span>
                              )}
                            </div>
                            {item.note ? (
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {item.note}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 italic mt-0.5">
                                ไม่ได้ระบุบันทึกช่วยจำ
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount & Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <div className="text-right">
                            <p
                              className={`text-sm sm:text-base font-bold tracking-tight ${
                                isIncome ? 'text-violet-700' : 'text-rose-600'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrency(item.amount)}
                            </p>
                          </div>

                          {/* Hover Action Buttons */}
                          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              id={`edit-btn-${item.id}`}
                              onClick={() => onEditTransaction(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-700 hover:bg-violet-50 transition"
                              title="แก้ไขรายการ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`delete-btn-${item.id}`}
                              onClick={() => setDeletingId(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-50 border-2 border-purple-100 text-purple-600 flex items-center justify-center mb-3 shadow-sm shadow-purple-100/50">
              <CircleDollarSign className="w-8 h-8 stroke-[2]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center justify-center gap-1.5">
              <span>ยังไม่มีรายการบันทึกในเดือนนี้</span>
              <span>✨</span>
            </h3>
            <p className="text-xs text-purple-400 mt-1 max-w-xs mx-auto font-medium">
              เริ่มต้นบันทึกรายรับหรือรายจ่ายแรกของคุณ หรือกดโหลดข้อมูลตัวอย่างเพื่อดูสรุปผลน่ารักๆ ได้เลยน้า 🌸
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                onClick={onOpenAddModal}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold shadow-sm shadow-purple-200/80 transition-all hover:-translate-y-0.5"
              >
                + เพิ่มรายการตอนนี้ 🌸
              </button>
              <button
                onClick={() => seedSampleData()}
                className="px-4 py-2.5 rounded-2xl border-2 border-purple-100 bg-white hover:bg-purple-50 text-purple-700 text-xs font-bold transition-all hover:-translate-y-0.5 shadow-2xs"
              >
                โหลดข้อมูลตัวอย่าง ✨
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/20 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-pink-100 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 text-pink-500 flex items-center justify-center shrink-0 shadow-2xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">ยืนยันการลบรายการ 🥺</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถเรียกคืนได้
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-2xl border-2 border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                disabled={isDeleting}
                className="px-5 py-2 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition"
              >
                {isDeleting ? 'กำลังลบ...' : 'ลบรายการ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
