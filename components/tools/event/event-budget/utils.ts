import { ExpenseItem, RevenueItem, TicketType } from "./types";

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
