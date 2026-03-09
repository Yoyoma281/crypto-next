import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a coin price with appropriate decimal places. */
export function fmtCoinPrice(p: number): string {
  if (p >= 1000) return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1)    return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (p >= 0.01) return "$" + p.toFixed(4);
  return "$" + p.toFixed(8);
}

/** Format a large number with B / M / T suffix. */
export function fmtLarge(n: number): string {
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6)  return "$" + (n / 1e6).toFixed(2) + "M";
  return "$" + n.toLocaleString("en-US");
}

export function formatPrice(
  value: number | string | null | undefined,
  decimal: boolean = false
): string {
  return value
    ? `$${Number(value).toLocaleString(
        "en-US",
        decimal ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {}
      )}`
    : "$0.00";
}
