import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoord(n: number, digits = 6) {
  return n.toFixed(digits);
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-GB", { hour12: false });
}
