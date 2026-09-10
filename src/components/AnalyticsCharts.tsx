import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Layers, Sparkles } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../lib/utils';
import { CategoryIcon } from './CategoryIcon';

export const AnalyticsCharts: React.FC = () => {
  const { categoryBreakdown, incomeCategoryBreakdown, dailyPoints, monthlySummary } = useTransactions();
  const [activeCategoryTab, setActiveCategoryTab] = useState<'expense' | 'income'>('expense');

  const currentBreakdown =
    activeCategoryTab === 'expense' ? categoryBreakdown : incomeCategoryBreakdown;
  const currentTotal =
    activeCategoryTab === 'expense' ? monthlySummary.totalExpense : monthlySummary.totalIncome;

  // Custom tooltip for Pie Chart
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-700">
          <p className="font-semibold">{data.name}</p>
          <p className="text-emerald-400 mt-0.5">{formatCurrency(data.amount)} ({data.percentage}%)</p>
          <p className="text-slate-400 text-[11px]">{data.count} รายการ</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for Daily Bar Chart
  const renderBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const day = label;
      const incomeVal = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
      const expenseVal = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
          <p className="font-semibold text-slate-300 pb-1 border-b border-slate-800">วันที่ {day}</p>
          <div className="mt-1.5 space-y-1">
            <p className="text-emerald-400 flex items-center justify-between gap-4">
              <span>รายรับ:</span>
              <span className="font-medium">{formatCurrency(incomeVal)}</span>
            </p>
            <p className="text-rose-400 flex items-center justify-between gap-4">
              <span>รายจ่าย:</span>
              <span className="font-medium">{formatCurrency(expenseVal)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Daily Income vs Expense Cashflow Chart (7 Cols) */}
      <div
        id="daily-cashflow-chart"
        className="lg:col-span-7 bg-white rounded-3xl p-5 border-2 border-purple-100/80 shadow-sm shadow-purple-100/50 flex flex-col justify-between"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>กราฟกระแสเงินสดรายวัน</span>
                <span className="text-xs">📊✨</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-10">
              เปรียบเทียบรายรับและรายจ่ายในแต่ละวันของเดือน
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              <span>รายรับ 💸</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 border border-pink-100">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
              <span>รายจ่าย 🛍️</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="h-64 w-full mt-2">
          {dailyPoints.some((p) => p.income > 0 || p.expense > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyPoints}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f3ff" />
                <XAxis
                  dataKey="dayLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#ede9fe' }}
                  tick={{ fontSize: 11, fill: '#7c3aed' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                />
                <Tooltip content={renderBarTooltip} cursor={{ fill: '#faf5ff' }} />
                <Bar
                  dataKey="income"
                  name="รายรับ"
                  fill="#9333ea"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="expense"
                  name="รายจ่าย"
                  fill="#fb7185"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-purple-400 text-xs gap-1.5 border-2 border-dashed border-purple-100 rounded-2xl bg-purple-50/30">
              <Sparkles className="w-6 h-6 text-purple-400 animate-bounce" />
              <p className="font-semibold text-purple-600">ยังไม่มีข้อมูลรายรับรายจ่ายในเดือนนี้</p>
              <p className="text-[11px] text-purple-400">กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มบันทึกความสดใสได้เลย 🌸</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Category Donut & Ranked Breakdown (5 Cols) */}
      <div
        id="category-breakdown-chart"
        className="lg:col-span-5 bg-white rounded-3xl p-5 border-2 border-purple-100/80 shadow-sm shadow-purple-100/50 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-pink-50 border border-pink-100 text-pink-500 flex items-center justify-center">
              <PieIcon className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1">
              <span>สัดส่วนหมวดหมู่</span>
              <span>🧁</span>
            </h2>
          </div>

          {/* Toggle Tab */}
          <div className="flex items-center bg-purple-50/80 p-1 rounded-2xl border border-purple-100 text-xs">
            <button
              onClick={() => setActiveCategoryTab('expense')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                activeCategoryTab === 'expense'
                  ? 'bg-white text-pink-600 shadow-2xs'
                  : 'text-purple-600 hover:text-purple-900'
              }`}
            >
              รายจ่าย 🛍️
            </button>
            <button
              onClick={() => setActiveCategoryTab('income')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                activeCategoryTab === 'income'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-purple-600 hover:text-purple-900'
              }`}
            >
              รายรับ 💸
            </button>
          </div>
        </div>

        {currentBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 items-center">
            {/* Donut Chart */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={renderPieTooltip} />
                  <Pie
                    data={currentBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={4}
                  >
                    {currentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center text in donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400">
                  {activeCategoryTab === 'expense' ? 'จ่ายรวม' : 'รับรวม'}
                </span>
                <span className="text-xs font-black text-slate-800">
                  {formatCurrency(currentTotal)}
                </span>
              </div>
            </div>

            {/* Top Categories List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {currentBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.name} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-700 truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-600 font-bold">{formatCurrency(cat.amount)}</span>
                      <span className="text-[11px] font-bold text-purple-600 w-7 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-purple-50 h-2 rounded-full overflow-hidden p-0.5 border border-purple-100/50">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
              {currentBreakdown.length > 4 && (
                <p className="text-[11px] font-semibold text-purple-500 text-center pt-1">
                  และอีก {currentBreakdown.length - 4} หมวดหมู่ 🌸
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="h-56 flex flex-col items-center justify-center text-purple-400 text-xs gap-1.5 border-2 border-dashed border-purple-100 rounded-2xl bg-purple-50/30">
            <Layers className="w-6 h-6 text-purple-300" />
            <p className="font-semibold text-purple-600">ยังไม่มีรายการ{activeCategoryTab === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};
