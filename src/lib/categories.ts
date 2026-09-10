import { CategoryInfo, TransactionType } from '../types';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหาร & เครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316' },
  { id: 'transport', name: 'การเดินทาง & ยานพาหนะ', type: 'expense', icon: 'Car', color: '#3b82f6' },
  { id: 'housing', name: 'ที่อยู่อาศัย & ค่าน้ำไฟ', type: 'expense', icon: 'Home', color: '#8b5cf6' },
  { id: 'shopping', name: 'ช้อปปิ้ง & เสื้อผ้า', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'health', name: 'สุขภาพ & การรักษา', type: 'expense', icon: 'HeartPulse', color: '#10b981' },
  { id: 'entertainment', name: 'บันเทิง & ท่องเที่ยว', type: 'expense', icon: 'Film', color: '#eab308' },
  { id: 'education', name: 'การศึกษา & พัฒนาตนเอง', type: 'expense', icon: 'GraduationCap', color: '#06b6d4' },
  { id: 'bills', name: 'ค่าบริการ & บิลโทรศัพท์', type: 'expense', icon: 'Receipt', color: '#64748b' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', type: 'expense', icon: 'Sparkles', color: '#94a3b8' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน & ค่าจ้าง', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'freelance', name: 'งานเสริม & ฟรีแลนซ์', type: 'income', icon: 'Sparkles', color: '#14b8a6' },
  { id: 'investment', name: 'เงินปันผล & ดอกเบี้ย', type: 'income', icon: 'TrendingUp', color: '#06b6d4' },
  { id: 'business', name: 'ค้าขาย & กำไรธุรกิจ', type: 'income', icon: 'Wallet', color: '#3b82f6' },
  { id: 'gift', name: 'ของขวัญ & โบนัส', type: 'income', icon: 'Gift', color: '#8b5cf6' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'DollarSign', color: '#84cc16' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryInfo(categoryName: string, type?: TransactionType): CategoryInfo {
  const found = ALL_CATEGORIES.find(c => c.name === categoryName);
  if (found) return found;

  if (type === 'income') {
    return { id: 'custom_income', name: categoryName, type: 'income', icon: 'DollarSign', color: '#10b981' };
  }
  return { id: 'custom_expense', name: categoryName, type: 'expense', icon: 'ShoppingBag', color: '#64748b' };
}
