import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ar-IQ", { dateStyle: "medium" }).format(new Date(value));
}

export function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function asOptionalString(value: FormDataEntryValue | null) {
  const text = asString(value);
  return text.length ? text : null;
}

export function asBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}
