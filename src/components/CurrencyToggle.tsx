import { useCurrency } from "@/lib/currency-context";
import type { Currency } from "@/lib/currency";

const OPTIONS: Array<{ value: Currency; label: string }> = [
  { value: "INR", label: "₹ INR" },
  { value: "USD", label: "$ USD" },
];

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Display currency"
      className="flex items-center gap-0.5 rounded-full border border-border bg-muted p-0.5"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setCurrency(o.value)}
          aria-pressed={currency === o.value}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
            currency === o.value
              ? "gradient-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
