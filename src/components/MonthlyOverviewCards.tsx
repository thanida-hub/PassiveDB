import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  WalletCards,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../lib/utils';

export const MonthlyOverviewCards: React.FC = () => {
  const { monthlySummary, previousMonthSummary } = useTransactions();

  // Percentage change vs previous month
  const incomeDiff =
    previousMonthSummary.totalIncome > 0
      ? Math.round(
          ((monthlySummary.totalIncome - previousMonthSummary.totalIncome) /
            previousMonthSummary.totalIncome) *
            100
        )
      : null;

  const expenseDiff =
    previousMonthSummary.totalExpense > 0
      ? Math.round(
          ((monthlySummary.totalExpense - previousMonthSummary.totalExpense) /
            previousMonthSummary.totalExpense) *
            100
        )
      : null;

  const isNetPositive = monthlySummary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. รายรับรวม */}
      <div
        id="card-total-income"
        className="bg-white rounded-3xl p-5 border-2 border-purple-100/80 shadow-sm shadow-purple-100/50 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <span>รายรับแฮปปี้</span>
            <span>💸</span>
          </span>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2.5">
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(monthlySummary.totalIncome)}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {incomeDiff !== null ? (
            <span
              className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full ${
                incomeDiff >= 0
                  ? 'bg-purple-100/80 text-purple-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {incomeDiff >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              {Math.abs(incomeDiff)}%
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
          <span className="text-slate-400 font-medium">เทียบกับเดือนที่แล้ว 🌸</span>
        </div>
      </div>

      {/* 2. รายจ่ายรวม */}
      <div
        id="card-total-expense"
        className="bg-white rounded-3xl p-5 border-2 border-pink-100/80 shadow-sm shadow-pink-100/40 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-pink-200 hover:-translate-y-0.5 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <span>รายจ่ายช้อปปิ้ง</span>
            <span>🛍️</span>
          </span>
          <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 text-pink-500 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
            <TrendingDown className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2.5">
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(monthlySummary.totalExpense)}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {expenseDiff !== null ? (
            <span
              className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full ${
                expenseDiff > 0
                  ? 'bg-pink-100/80 text-pink-600'
                  : 'bg-purple-100/80 text-purple-700'
              }`}
            >
              {expenseDiff > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              {Math.abs(expenseDiff)}%
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
          <span className="text-slate-400 font-medium">เทียบกับเดือนที่แล้ว 🌸</span>
        </div>
      </div>

      {/* 3. ยอดคงเหลือสุทธิ */}
      <div
        id="card-net-balance"
        className={`rounded-3xl p-5 border-2 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group ${
          isNetPositive
            ? 'bg-white border-purple-100/90 shadow-purple-100/50 hover:border-purple-200'
            : 'bg-rose-50/40 border-rose-200/80 shadow-rose-100/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <span>กระเป๋าคงเหลือ</span>
            <span>👛</span>
          </span>
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform ${
              isNetPositive
                ? 'bg-purple-50 border-purple-100 text-purple-600'
                : 'bg-rose-100 border-rose-200 text-rose-600'
            }`}
          >
            <WalletCards className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2.5">
          <p
            className={`text-2xl font-black tracking-tight ${
              isNetPositive ? 'text-purple-700' : 'text-rose-600'
            }`}
          >
            {isNetPositive ? '' : '-'}
            {formatCurrency(Math.abs(monthlySummary.netBalance))}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {isNetPositive ? 'กระแสเงินสดสดใส ✨' : 'รายจ่ายเกินรายรับ 🥺'}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              isNetPositive
                ? 'bg-purple-100 text-purple-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {monthlySummary.transactionCount} รายการ
          </span>
        </div>
      </div>

      {/* 4. อัตราการออม */}
      <div
        id="card-savings-rate"
        className="bg-white rounded-3xl p-5 border-2 border-purple-100/80 shadow-sm shadow-purple-100/50 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <span>กระปุกออมสิน</span>
            <span>🐷</span>
          </span>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
            <PiggyBank className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {monthlySummary.savingsRate}%
          </p>
          <span className="text-xs text-purple-700 font-bold px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100">
            {monthlySummary.savingsRate >= 30
              ? 'สุดยอดเลย! ⭐'
              : monthlySummary.savingsRate >= 10
              ? 'เก็บได้ดีนะ 🌱'
              : 'สู้ๆ น้า 🧁'}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full bg-purple-50 h-2.5 rounded-full overflow-hidden p-0.5 border border-purple-100/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              monthlySummary.savingsRate >= 30
                ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                : monthlySummary.savingsRate >= 10
                ? 'bg-gradient-to-r from-violet-400 to-purple-400'
                : 'bg-gradient-to-r from-amber-300 to-rose-400'
            }`}
            style={{ width: `${Math.min(100, monthlySummary.savingsRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
