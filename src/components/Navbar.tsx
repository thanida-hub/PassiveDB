import React, { useState } from 'react';
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Database,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { formatThaiMonthYear, getCurrentMonthKey } from '../lib/utils';

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { user, isFirebaseConnected, signInWithGoogle, logout, loading: authLoading } = useAuth();
  const { selectedMonth, shiftMonthBy, setSelectedMonth } = useTransactions();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentMonthKey = getCurrentMonthKey();
  const isCurrentMonth = selectedMonth === currentMonthKey;

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-purple-100/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Project badge */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl p-1 bg-white border-2 border-purple-100 shadow-sm shadow-purple-100/60 flex items-center justify-center shrink-0 overflow-hidden hover:scale-105 transition-transform duration-200">
              <img
                src="/pvclogo.png"
                alt="ตราวิทยาลัยอาชีวศึกษาแพร่"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-none flex items-center gap-1.5">
                  <span>จัดการรายรับรายจ่าย</span>
                  <span className="text-sm">✨</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/70 shadow-2xs">
                  <Database className="w-3 h-3 text-purple-500" />
                  PassiveDB
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFirebaseConnected ? 'bg-emerald-400 ring-2 ring-emerald-100 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>
                  {isFirebaseConnected ? 'ซิงค์ Firestore แล้ว' : 'กำลังเชื่อมต่อ'} • วอศ.แพร่ 🌸
                </span>
              </p>
            </div>
          </div>

          {/* Month Selector in Header */}
          <div className="hidden md:flex items-center bg-purple-50/50 p-1 rounded-2xl border-2 border-purple-100/80 shadow-2xs">
            <button
              id="prev-month-btn"
              onClick={() => shiftMonthBy(-1)}
              className="p-1.5 rounded-xl text-purple-600 hover:text-purple-900 hover:bg-white transition active:scale-95"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <div className="px-3.5 py-1 flex items-center gap-2 min-w-[160px] justify-center font-bold text-purple-950 text-xs sm:text-sm">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>{formatThaiMonthYear(selectedMonth)}</span>
            </div>
            <button
              id="next-month-btn"
              onClick={() => shiftMonthBy(1)}
              className="p-1.5 rounded-xl text-purple-600 hover:text-purple-900 hover:bg-white transition active:scale-95"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            {!isCurrentMonth && (
              <button
                id="current-month-btn"
                onClick={() => setSelectedMonth(currentMonthKey)}
                className="ml-1 px-3 py-1 text-xs font-bold text-purple-700 bg-white hover:bg-purple-100/80 rounded-xl transition shadow-2xs"
              >
                เดือนนี้ ✨
              </button>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="add-transaction-nav-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-200/70 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">เพิ่มรายการ ✨</span>
            </button>

            {/* Auth section */}
            {authLoading ? (
              <div className="w-9 h-9 rounded-full bg-purple-100 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full border-2 border-purple-200 hover:border-purple-300 bg-white transition shadow-2xs hover:scale-105"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-purple-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                      {user.displayName?.charAt(0) || <UserIcon className="w-4 h-4" />}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-purple-900 max-w-[100px] truncate hidden sm:inline">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white border-2 border-purple-100 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-purple-50">
                      <p className="text-[11px] text-slate-400">เข้าสู่ระบบด้วย Gmail 🌸</p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {user.displayName || 'ผู้ใช้งาน'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full w-fit border border-purple-100">
                        <CheckCircle2 className="w-3 h-3 text-purple-500" /> ซิงค์ Firestore (PassiveDB)
                      </div>
                    </div>
                    <button
                      id="logout-btn"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="google-signin-btn"
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 border-purple-200 hover:border-purple-300 bg-white hover:bg-purple-50/40 text-purple-900 text-xs sm:text-sm font-semibold transition shadow-2xs hover:scale-102"
              >
                {/* Google Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าสู่ระบบ Gmail</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile month selector bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-purple-50">
          <button
            onClick={() => shiftMonthBy(-1)}
            className="p-1.5 rounded-xl text-purple-600 hover:bg-purple-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 font-bold text-purple-950 text-xs sm:text-sm">
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span>{formatThaiMonthYear(selectedMonth)}</span>
            {!isCurrentMonth && (
              <button
                onClick={() => setSelectedMonth(currentMonthKey)}
                className="ml-2 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 bg-purple-100 rounded-full"
              >
                เดือนนี้ ✨
              </button>
            )}
          </div>
          <button
            onClick={() => shiftMonthBy(1)}
            className="p-1.5 rounded-xl text-purple-600 hover:bg-purple-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
