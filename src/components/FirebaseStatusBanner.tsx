import React from 'react';
import { Database, ShieldCheck, UserCheck, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';

export const FirebaseStatusBanner: React.FC = () => {
  const { user, isFirebaseConnected, signInWithGoogle } = useAuth();
  const { filteredTransactions, selectedMonth } = useTransactions();

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน', 'ช่องทางชำระ', 'บันทึกช่วยจำ'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category}"`,
      t.amount,
      `"${t.paymentMethod || ''}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `passivedb_transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (user) {
    return (
      <div className="bg-purple-50/70 border-2 border-purple-100/90 rounded-3xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-950 shadow-sm shadow-purple-100/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="font-bold text-purple-950 flex items-center gap-1.5">
              <span>กำลังบันทึกข้อมูลแบบเรียลไทม์ไว้ที่ Firebase Project: PassiveDB</span>
              <span>✨🌸</span>
            </p>
            <p className="text-purple-700 text-[11px] mt-0.5 font-medium">
              เข้าสู่ระบบด้วย Gmail: <span className="font-bold text-purple-900">{user.email}</span> (ข้อมูลแยกบัญชีปลอดภัย 100%)
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredTransactions.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border-2 border-purple-100 hover:bg-purple-100/50 text-purple-800 font-bold transition self-start sm:self-auto disabled:opacity-40 shadow-2xs hover:scale-105 active:scale-95"
          title="ดาวน์โหลดไฟล์ CSV สำหรับเดือนนี้"
        >
          <Download className="w-3.5 h-3.5 text-purple-600" />
          <span>ส่งออก CSV 📄</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50/50 to-purple-50 border-2 border-purple-100/90 rounded-3xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-950 shadow-sm shadow-purple-100/40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
          <Database className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <p className="font-bold text-purple-950 flex items-center gap-1.5">
            <span>ใช้งานในโหมดตัวอย่าง (Demo Mode)</span>
            <span>🧸✨</span>
          </p>
          <p className="text-purple-700 text-[11px] mt-0.5 font-medium">
            เข้าสู่ระบบด้วย Gmail เพื่อเปิดใช้งานการบันทึกข้อมูลถาวรบน Cloud Firestore ในโปรเจกต์ PassiveDB
          </p>
        </div>
      </div>

      <button
        id="banner-signin-btn"
        onClick={signInWithGoogle}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold transition shadow-sm shadow-purple-200 self-start sm:self-auto hover:scale-105 active:scale-95"
      >
        <span>เข้าสู่ระบบด้วย Gmail 🌸</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
