const USD_TO_INR = 83;

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

export function formatINR(value: number): string {
  return `₹${groupIndian(value)}`;
}

/**
 * Displays any money string in Indian Rupees.
 * Legacy/AI values written in dollars are converted at a fixed rate;
 * values already in ₹ are returned untouched.
 */
export function toINR(text: string | null | undefined): string {
  if (!text) return "";
  if (!text.includes("$")) return text;
  return text.replace(/\$\s?([\d,]+(?:\.\d+)?)/g, (_m, num: string) => {
    const amount = parseFloat(num.replace(/,/g, ""));
    if (Number.isNaN(amount)) return _m;
    return formatINR(amount * USD_TO_INR);
  }).replace(/\bUSD\b/g, "INR");
}
