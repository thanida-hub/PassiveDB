import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Check,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryInfo } from '../lib/categories';
import { getTodayDateString } from '../lib/utils';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    note?: string;
    paymentMethod?: PaymentMethod | string;
  }) => Promise<void>;
  initialData?: Transaction | null;
  selectedMonth: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  selectedMonth,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('อาหาร & เครื่องดื่ม');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state on open / initialData change
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note || '');
      setPaymentMethod(initialData.paymentMethod || 'cash');
    } else {
      setType('expense');
      setAmountStr('');
      setCategory('อาหาร & เครื่องดื่ม');
      // Default to today if within selected month, else first day of month
      const today = getTodayDateString();
      if (today.startsWith(selectedMonth)) {
        setDate(today);
      } else {
        setDate(`${selectedMonth}-01`);
      }
      setNote('');
      setPaymentMethod('transfer');
    }
    setFormError(null);
  }, [initialData, isOpen, selectedMonth]);

  // If type changes and current category does not belong, pick default
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const addAmount = (delta: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('กรุณากรอกจำนวนเงินที่ถูกต้องและมากกว่า 0');
      return;
    }

    if (!category.trim()) {
      setFormError('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date.trim()) {
      setFormError('กรุณาเลือกวันที่');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        type,
        amount: parsedAmount,
        category,
        date,
        note: note.trim(),
        paymentMethod,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (!isOpen) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/25 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="transaction-modal-container"
        className="bg-white rounded-3xl w-full max-w-lg border-2 border-purple-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-purple-50 flex items-center justify-between bg-purple-50/40">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
            <span>{initialData ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</span>
            <span>✨🌸</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-purple-400 hover:text-purple-700 hover:bg-purple-100/60 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {formError && (
            <div className="p-3 rounded-2xl bg-pink-50 text-pink-700 text-xs font-bold border border-pink-200">
              {formError}
            </div>
          )}

          {/* Type Segmented Control */}
          <div className="grid grid-cols-2 p-1 bg-purple-50/70 rounded-2xl border border-purple-100">
            <button
              type="button"
              id="type-expense-btn"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              <span>รายจ่าย 🛍️</span>
            </button>
            <button
              type="button"
              id="type-income-btn"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-purple-600 text-white shadow-xs shadow-purple-300/80'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              <span>รายรับ 💸</span>
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400 font-bold text-lg">
                ฿
              </div>
              <input
                id="transaction-amount-input"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-2xl text-2xl font-black text-purple-950 placeholder-purple-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                autoFocus
                required
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addAmount(val)}
                  className="px-3 py-1 text-xs font-bold bg-purple-50 border border-purple-100 hover:bg-purple-100 text-purple-700 rounded-xl transition"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2.5 py-1 text-xs font-semibold text-purple-400 hover:text-purple-700 ml-auto"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-2.5 rounded-2xl border-2 text-left flex flex-col gap-1.5 transition ${
                      isSelected
                        ? 'border-purple-400 bg-purple-50/80 ring-2 ring-purple-400/20 shadow-2xs scale-[1.02]'
                        : 'border-purple-100/70 hover:border-purple-200 bg-white hover:bg-purple-50/30'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={16} />
                    </div>
                    <span
                      className={`text-xs leading-tight truncate w-full ${
                        isSelected ? 'text-purple-950 font-bold' : 'text-slate-700 font-medium'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                วันที่ทำรายการ *
              </label>
              <div className="relative">
                <input
                  id="transaction-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-purple-50/30 border-2 border-purple-100 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ช่องทางชำระเงิน
              </label>
              <select
                id="transaction-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-purple-50/30 border-2 border-purple-100 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              >
                <option value="transfer">โอนเงิน / QR Code 📱</option>
                <option value="cash">เงินสด (Cash) 💵</option>
                <option value="credit_card">บัตรเครดิต / เดบิต 💳</option>
                <option value="other">อื่นๆ 🎈</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              บันทึกช่วยจำ (Note)
            </label>
            <input
              id="transaction-note-input"
              type="text"
              maxLength={300}
              placeholder="เช่น ซื้อของขวัญ, ขนมหวาน, ชานมไข่มุก..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 bg-purple-50/30 border-2 border-purple-100 rounded-2xl text-xs text-slate-800 placeholder-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="save-transaction-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl font-bold text-white text-sm shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-200'
                  : 'bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-200'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {isSubmitting
                  ? 'กำลังบันทึก...'
                  : initialData
                  ? 'บันทึกการแก้ไข ✨'
                  : type === 'expense'
                  ? 'บันทึกรายจ่าย 🛍️'
                  : 'บันทึกรายรับ 💸'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
