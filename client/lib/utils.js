import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_LOCALES = {
  USD: 'en-US',
  INR: 'en-IN',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
  JPY: 'ja-JP',
  SGD: 'en-SG',
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
  JPY: '¥',
  SGD: 'S$',
};

export function getActiveCurrency() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('finflow_currency') || 'USD';
  }
  return 'USD';
}

export function setActiveCurrency(curr) {
  if (typeof window !== 'undefined' && curr) {
    localStorage.setItem('finflow_currency', curr);
    window.dispatchEvent(new CustomEvent('finflow-currency-change', { detail: curr }));
  }
}

export function getCurrencySymbol(curr) {
  const code = curr || getActiveCurrency();
  return CURRENCY_SYMBOLS[code] || '$';
}

export function getCurrencyLocale(curr) {
  const code = curr || getActiveCurrency();
  return CURRENCY_LOCALES[code] || 'en-US';
}

export function formatCurrency(amount, currency) {
  const curr = currency || getActiveCurrency();
  const locale = getCurrencyLocale(curr);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

export function formatPdfCurrency(amount, currency) {
  const curr = currency || getActiveCurrency();
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const formatted = new Intl.NumberFormat(curr === 'INR' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absNum);

  let prefix = '';
  if (curr === 'INR') prefix = 'Rs. ';
  else if (curr === 'USD') prefix = '$';
  else if (curr === 'EUR') prefix = 'EUR ';
  else if (curr === 'GBP') prefix = 'GBP ';
  else if (curr === 'CAD') prefix = 'CAD $';
  else if (curr === 'AUD') prefix = 'AUD $';
  else if (curr === 'JPY') prefix = 'JPY ';
  else prefix = `${curr} `;

  return `${isNegative ? '-' : ''}${prefix}${formatted}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateInput(date) {
  return new Date(date).toISOString().split('T')[0];
}

export function getInitials(name) {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
}

export function getDaysUntilDue(dueDay) {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (dueDay >= currentDay) return dueDay - currentDay;
  return daysInMonth - currentDay + dueDay;
}
