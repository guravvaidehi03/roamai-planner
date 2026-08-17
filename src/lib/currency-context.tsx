import { createContext, useContext, useMemo, type ReactNode } from "react";
import { convertMoneyText, formatCurrency, type Currency } from "@/lib/currency";

type CurrencyContextValue = {
  currency: Currency;
  /** Formats any money string (₹/$/€ mixed text) as Indian Rupees. */
  money: (text: string | null | undefined) => string;
  /** Formats a numeric amount as Indian Rupees. */
  format: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/** The app is INR-only: every user-facing price is rendered in ₹. */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency: "INR",
      money: (text) => convertMoneyText(text, "INR"),
      format: (amount) => formatCurrency(amount),
    }),
    [],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
