export type Currency = "INR" | "USD";

export const USD_TO_INR = 83;

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
};

function groupIndian(value: number): string {
  const s = Math.round(value).toString();
  if (s.length <= 3) return s;
  let head = s.slice(0, -3);
  const tail = s.slice(-3);
  const parts: string[] = [];
  while (head.length > 2) {
    parts.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  if (head) parts.unshift(head);
  return `${parts.join(",")},${tail}`;
}

function groupWestern(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function formatMoney(amount: number, currency: Currency): string {
  return currency === "INR"
    ? `₹${groupIndian(amount)}`
    : `$${groupWestern(amount)}`;
}

export function formatINR(value: number): string {
  return formatMoney(value, "INR");
}

/**
 * Rewrites every money value inside a free-form string (e.g. "₹8,000 - ₹12,000
 * per night") into the requested currency. Values already in the target
 * currency are left untouched apart from consistent grouping.
 */
export function convertMoneyText(
  text: string | null | undefined,
  currency: Currency = "INR",
): string {
  if (!text) return "";
  return text
    .replace(/([₹$])\s?([\d,]+(?:\.\d+)?)/g, (match, symbol: string, num: string) => {
      const parsed = parseFloat(num.replace(/,/g, ""));
      if (Number.isNaN(parsed)) return match;
      const inr = symbol === "₹" ? parsed : parsed * USD_TO_INR;
      const value = currency === "INR" ? inr : inr / USD_TO_INR;
      return formatMoney(value, currency);
    })
    .replace(/\b(USD|INR)\b/g, currency);
}

/** Legacy helper: always renders in Indian Rupees. */
export function toINR(text: string | null | undefined): string {
  return convertMoneyText(text, "INR");
}
