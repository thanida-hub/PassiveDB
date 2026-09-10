export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function formatCurrency(amount: number, showSign = false): string {
  const formatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (showSign && amount > 0) {
    return `+฿${formatted}`;
  } else if (amount < 0) {
    return `-฿${formatted}`;
  }
  return `฿${formatted}`;
}

export function formatThaiDate(dateStr: string, includeYear = true): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const thaiYear = year + 543;
  const monthName = THAI_MONTHS_SHORT[monthIdx] || '';

  if (includeYear) {
    return `${day} ${monthName} ${thaiYear}`;
  }
  return `${day} ${monthName}`;
}

export function formatThaiMonthYear(monthStr: string): string {
  // monthStr: YYYY-MM
  if (!monthStr) return '';
  const [yearStr, mStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(mStr, 10) - 1;
  const thaiYear = year + 543;
  const monthName = THAI_MONTHS_FULL[monthIdx] || '';
  return `${monthName} ${thaiYear}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthDates(monthKey: string): { daysInMonth: number; year: number; month: number } {
  const [yearStr, mStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(mStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  return { daysInMonth, year, month };
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [yearStr, mStr] = monthKey.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(mStr, 10) + delta;

  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}
