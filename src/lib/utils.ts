import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
