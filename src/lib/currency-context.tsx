import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { convertMoneyText, type Currency } from "@/lib/currency";

const STORAGE_KEY = "roamai:currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  /** Formats any money string (or ₹/$ mixed text) in the active currency. */
  money: (text: string | null | undefined) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("INR");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "USD" || stored === "INR") setCurrencyState(stored);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    window.localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      toggleCurrency: () => setCurrency(currency === "INR" ? "USD" : "INR"),
      money: (text) => convertMoneyText(text, currency),
    }),
    [currency, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
