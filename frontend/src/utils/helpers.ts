import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function parseApiDate(value: string): Date {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}