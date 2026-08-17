/**
 * Centralised currency system — the app is built for Indian travellers, so
 * every user-facing money value is rendered in Indian Rupees (₹) with Indian
 * digit grouping (1,25,000 rather than 125,000).
 *
 * Anything that arrives as USD (legacy saved trips, an occasional AI slip) is
 * converted with USD_TO_INR before it is displayed — the symbol is never just
 * swapped.
 */

export type Currency = "INR";

export const USD_TO_INR = 83;
export const EUR_TO_INR = 90;
export const GBP_TO_INR = 105;

export const CURRENCY_SYMBOL: Record<Currency, string> = { INR: "₹" };

/** Indian digit grouping: 1,25,000 / 2,50,00,000 */
function groupIndian(value: number): string {
  const negative = value < 0;
  const s = Math.round(Math.abs(value)).toString();
  let grouped: string;
  if (s.length <= 3) {
    grouped = s;
  } else {
    let head = s.slice(0, -3);
    const tail = s.slice(-3);
    const parts: string[] = [];
    while (head.length > 2) {
      parts.unshift(head.slice(-2));
      head = head.slice(0, -2);
    }
    if (head) parts.unshift(head);
    grouped = `${parts.join(",")},${tail}`;
  }
  return negative ? `-${grouped}` : grouped;
}

/** THE formatter to use everywhere: formatCurrency(41500) -> "₹41,500" */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${groupIndian(amount)}`;
}

/** Backwards-compatible aliases used across the app. */
export function formatINR(value: number): string {
  return formatCurrency(value);
}
export function formatMoney(amount: number, _currency: Currency = "INR"): string {
  return formatCurrency(amount);
}

const RATES: Record<string, number> = {
  "₹": 1,
  $: USD_TO_INR,
  "€": EUR_TO_INR,
  "£": GBP_TO_INR,
};

/** Parses the first money value in a free-form string into rupees. */
export function parseMoneyToINR(text: string | null | undefined): number {
  if (!text) return 0;
  const match = text.match(/([₹$€£])?\s?([\d][\d,]*(?:\.\d+)?)\s*(k|lakh|lakhs|cr|crore)?/i);
  if (!match) return 0;
  const symbol = match[1] ?? "₹";
  let value = parseFloat(match[2].replace(/,/g, ""));
  if (Number.isNaN(value)) return 0;
  const unit = (match[3] ?? "").toLowerCase();
  if (unit === "k") value *= 1_000;
  else if (unit.startsWith("lakh")) value *= 100_000;
  else if (unit === "cr" || unit === "crore") value *= 10_000_000;
  return value * (RATES[symbol] ?? 1);
}

const WORD_RATES: Record<string, number> = {
  usd: USD_TO_INR,
  "us dollar": USD_TO_INR,
  "us dollars": USD_TO_INR,
  dollar: USD_TO_INR,
  dollars: USD_TO_INR,
  eur: EUR_TO_INR,
  euro: EUR_TO_INR,
  euros: EUR_TO_INR,
  gbp: GBP_TO_INR,
  inr: 1,
  rs: 1,
  rupee: 1,
  rupees: 1,
};

/**
 * Rewrites every money value inside a free-form string (e.g. "$100 - $150 per
 * night", "USD 500", "around 300 dollars") into Indian Rupees, converting
 * non-INR values instead of relabelling them, and normalising the grouping of
 * values already in ₹.
 */
export function convertMoneyText(
  text: string | null | undefined,
  _currency: Currency = "INR",
): string {
  if (!text) return "";
  let out = text
    // Symbol-prefixed: "$100", "€50", "₹1,200"
    .replace(/([₹$€£])\s?([\d][\d,]*(?:\.\d+)?)/g, (match, symbol: string, num: string) => {
      const parsed = parseFloat(num.replace(/,/g, ""));
      if (Number.isNaN(parsed)) return match;
      return formatCurrency(parsed * (RATES[symbol] ?? 1));
    })
    // Word-prefixed: "USD 500", "around 300 dollars", "EUR 1,200"
    .replace(
      /\b(USD|US\s?Dollars?|Dollars?|EUR|Euros?|GBP|INR|Rs\.?|Rupees?)\s?([\d][\d,]*(?:\.\d+)?)/gi,
      (match, word: string, num: string) => {
        const parsed = parseFloat(num.replace(/,/g, ""));
        if (Number.isNaN(parsed)) return match;
        const rate = WORD_RATES[word.toLowerCase().replace(/\s+/g, " ").trim()] ?? 1;
        return formatCurrency(parsed * rate);
      },
    )
    // Suffix word: "500 USD", "1,200 dollars", "50 euros"
    .replace(
      /([\d][\d,]*(?:\.\d+)?)\s?(USD|US\s?Dollars?|Dollars?|EUR|Euros?|GBP|INR|Rs\.?|Rupees?)\b/gi,
      (match, num: string, word: string) => {
        const parsed = parseFloat(num.replace(/,/g, ""));
        if (Number.isNaN(parsed)) return match;
        const rate = WORD_RATES[word.toLowerCase().replace(/\s+/g, " ").trim()] ?? 1;
        return formatCurrency(parsed * rate);
      },
    );
  return out;
}

/** Legacy helper: always renders in Indian Rupees. */
export function toINR(text: string | null | undefined): string {
  return convertMoneyText(text, "INR");
}
