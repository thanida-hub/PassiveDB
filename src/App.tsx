/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider, useTransactions } from './context/TransactionContext';
import { Navbar } from './components/Navbar';
import { MonthlyOverviewCards } from './components/MonthlyOverviewCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { FirebaseStatusBanner } from './components/FirebaseStatusBanner';
import { Transaction } from './types';
import { Plus, AlertCircle, X } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { error: authError, clearError } = useAuth();
  const { addTransaction, updateTransaction, selectedMonth } = useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-pink-50/15 to-purple-50/30 text-slate-800 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      {/* Navigation Header */}
      <Navbar onOpenAddModal={handleOpenAddModal} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Auth Error Notification */}
        {authError && (
          <div className="p-4 rounded-3xl bg-pink-50 border-2 border-pink-200 text-pink-800 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-pink-600 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={clearError}
              className="text-pink-500 hover:text-pink-700 p-1 rounded-xl hover:bg-pink-100 transition"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Firebase & Auth Status Banner */}
        <FirebaseStatusBanner />

        {/* 1. Monthly Summary Cards */}
        <section aria-label="สรุปภาพรวมรายเดือน">
          <MonthlyOverviewCards />
        </section>

        {/* 2. Analytics & Visual Charts */}
        <section aria-label="กราฟวิเคราะห์ข้อมูล">
          <AnalyticsCharts />
        </section>

        {/* 3. Transaction Records & History */}
        <section aria-label="รายการบันทึกรายรับรายจ่าย">
          <TransactionList
            onOpenAddModal={handleOpenAddModal}
            onEditTransaction={handleEditTransaction}
          />
        </section>
      </main>

      {/* Floating Action Button (FAB) on Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <button
          id="mobile-fab-add-btn"
          onClick={handleOpenAddModal}
          className="w-14 h-14 rounded-3xl bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          aria-label="เพิ่มรายการ"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        selectedMonth={selectedMonth}
      />

      {/* Footer */}
      <footer className="py-6 border-t-2 border-purple-100/70 text-center text-xs text-purple-600 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 mt-4">
        <div className="flex items-center gap-2">
          <img
            src="/pvclogo.png"
            alt="วิทยาลัยอาชีวศึกษาแพร่"
            className="w-5 h-5 object-contain hover:scale-110 transition-transform"
            referrerPolicy="no-referrer"
          />
          <span className="font-bold text-slate-800">วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College) 🌸</span>
        </div>
        <p className="text-[11px] text-purple-400 font-medium">
          ระบบจัดการรายรับรายจ่ายน่ารักสดใส • ซิงค์ฐานข้อมูล Firebase Firestore (PassiveDB) • เข้าสู่ระบบด้วย Gmail ✨
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <DashboardContent />
      </TransactionProvider>
    </AuthProvider>
  );
}
