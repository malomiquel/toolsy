import { ExpenseItem, RevenueItem, TicketType, ExpenseCategory } from "./types";

export const validateTickets = (value: unknown): TicketType[] | null => {
  if (!Array.isArray(value)) return null;
  return value as TicketType[];
};

export const validateRevenues = (value: unknown): RevenueItem[] | null => {
  if (!Array.isArray(value)) return null;
  return value as RevenueItem[];
};

export const validateExpenses = (value: unknown): ExpenseItem[] | null => {
  if (!Array.isArray(value)) return null;
  return value as ExpenseItem[];
};

export const validateCategories = (
  value: unknown,
): ExpenseCategory[] | null => {
  if (!Array.isArray(value)) return null;
  return value as ExpenseCategory[];
};

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const toTTC = (amount: number, vatRate: number, isHT?: boolean) =>
  isHT ? amount * (1 + vatRate / 100) : amount;
