'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActiveCurrency, setActiveCurrency, getCurrencySymbol, getCurrencyLocale, formatCurrency } from '@/lib/utils';

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => {
    if (typeof window !== 'undefined') {
      return getActiveCurrency();
    }
    return 'USD';
  });

  useEffect(() => {
    // Initial sync
    setCurrencyState(getActiveCurrency());

    const handleCurrencyEvent = (e) => {
      setCurrencyState(e.detail || getActiveCurrency());
    };

    window.addEventListener('finflow-currency-change', handleCurrencyEvent);
    return () => window.removeEventListener('finflow-currency-change', handleCurrencyEvent);
  }, []);

  const changeCurrency = useCallback((newCurr) => {
    setActiveCurrency(newCurr);
    setCurrencyState(newCurr);
  }, []);

  return {
    currency,
    symbol: getCurrencySymbol(currency),
    locale: getCurrencyLocale(currency),
    format: (amt) => formatCurrency(amt, currency),
    changeCurrency,
  };
}
