"use client";

import { useMemo, useCallback, useState } from "react";
import {
  useQueryStates,
  parseAsString,
  parseAsJson,
  parseAsFloat,
} from "nuqs";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  DEFAULT_EXPENSES,
  DEFAULT_REVENUES,
  DEFAULT_TICKETS,
  DEFAULT_CATEGORIES,
  TicketType,
  ExpenseCategory,
  type BudgetStats,
} from "./types";
import {
  validateExpenses,
  validateRevenues,
  validateTickets,
  validateCategories,
  toTTC,
} from "./utils";

function reorderList<T extends { id: string }>(
  list: T[],
  activeId: string,
  overId: string,
): T[] | null {
  const oldIndex = list.findIndex((item) => item.id === activeId);
  const newIndex = list.findIndex((item) => item.id === overId);
  if (oldIndex === -1 || newIndex === -1) return null;
  return arrayMove(list, oldIndex, newIndex);
}

export function useBudgetState() {
  const [params, setParams] = useQueryStates(
    {
      eventName: parseAsString.withDefault("Mon événement"),
      tickets: parseAsJson(validateTickets).withDefault(DEFAULT_TICKETS),
      revenues: parseAsJson(validateRevenues).withDefault(DEFAULT_REVENUES),
      expenses: parseAsJson(validateExpenses).withDefault(DEFAULT_EXPENSES),
      categories:
        parseAsJson(validateCategories).withDefault(DEFAULT_CATEGORIES),
      vatRate: parseAsFloat.withDefault(20),
    },
    { history: "replace" },
  );

  const { eventName, tickets, revenues, expenses, categories, vatRate } =
    params;

  const [editingRevenueId, setEditingRevenueId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // --- Share ---
  const handleShare = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("eventName", eventName);
    url.searchParams.set("tickets", JSON.stringify(tickets));
    url.searchParams.set("revenues", JSON.stringify(revenues));
    url.searchParams.set("expenses", JSON.stringify(expenses));
    url.searchParams.set("categories", JSON.stringify(categories));
    url.searchParams.set("vatRate", String(vatRate));

    const shareUrl = url.toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [eventName, tickets, revenues, expenses, categories, vatRate]);

  // --- Ticket handlers ---
  const addTicket = useCallback(() => {
    setParams({
      tickets: [
        ...tickets,
        {
          id: `ticket-${Date.now()}`,
          name: "",
          price: 0,
          quantity: 0,
          maxQuantity: 0,
        },
      ],
    });
  }, [tickets, setParams]);

  const updateTicket = useCallback(
    (
      id: string,
      field: keyof Omit<TicketType, "id">,
      value: string | number,
    ) => {
      setParams({
        tickets: tickets.map((t) =>
          t.id === id ? { ...t, [field]: value } : t,
        ),
      });
    },
    [tickets, setParams],
  );

  const removeTicket = useCallback(
    (id: string) => {
      setParams({ tickets: tickets.filter((t) => t.id !== id) });
    },
    [tickets, setParams],
  );

  // --- Revenue handlers ---
  const addRevenue = useCallback(() => {
    const newId = `revenue-${Date.now()}`;
    setParams({
      revenues: [
        ...revenues,
        { id: newId, label: "", amount: 0, iconKey: "coins", isDefault: false },
      ],
    });
    setEditingRevenueId(newId);
  }, [revenues, setParams]);

  const updateRevenue = useCallback(
    (
      id: string,
      field: "amount" | "perPerson" | "personCount" | "isHT",
      value: number | boolean | undefined,
    ) => {
      setParams({
        revenues: revenues.map((r) =>
          r.id === id ? { ...r, [field]: value } : r,
        ),
      });
    },
    [revenues, setParams],
  );

  const updateRevenueLabel = useCallback(
    (id: string, label: string) => {
      setParams({
        revenues: revenues.map((r) => (r.id === id ? { ...r, label } : r)),
      });
    },
    [revenues, setParams],
  );

  const removeRevenue = useCallback(
    (id: string) => {
      setParams({ revenues: revenues.filter((r) => r.id !== id) });
    },
    [revenues, setParams],
  );

  // --- Expense handlers ---
  const addExpense = useCallback(() => {
    const newId = `expense-${Date.now()}`;
    setParams({
      expenses: [
        ...expenses,
        {
          id: newId,
          label: "",
          amount: 0,
          perPerson: false,
          iconKey: "more",
          isDefault: false,
        },
      ],
    });
    setEditingExpenseId(newId);
  }, [expenses, setParams]);

  const updateExpense = useCallback(
    (
      id: string,
      field: "amount" | "perPerson" | "personCount" | "isHT",
      value: number | boolean | undefined,
    ) => {
      setParams({
        expenses: expenses.map((e) =>
          e.id === id ? { ...e, [field]: value } : e,
        ),
      });
    },
    [expenses, setParams],
  );

  const updateExpenseLabel = useCallback(
    (id: string, label: string) => {
      setParams({
        expenses: expenses.map((e) => (e.id === id ? { ...e, label } : e)),
      });
    },
    [expenses, setParams],
  );

  const updateExpenseCategory = useCallback(
    (id: string, category: string | null | undefined) => {
      setParams({
        expenses: expenses.map((e) =>
          e.id === id ? { ...e, category: category ?? undefined } : e,
        ),
      });
    },
    [expenses, setParams],
  );

  const removeExpense = useCallback(
    (id: string) => {
      setParams({ expenses: expenses.filter((e) => e.id !== id) });
    },
    [expenses, setParams],
  );

  // --- Category handlers ---
  const addCategory = useCallback(
    (name: string, color: string) => {
      const newCategory: ExpenseCategory = {
        id: `cat-${Date.now()}`,
        name,
        color,
      };
      setParams({ categories: [...categories, newCategory] });
    },
    [categories, setParams],
  );

  const removeCategory = useCallback(
    (id: string) => {
      setParams({
        categories: categories.filter((c) => c.id !== id),
        expenses: expenses.map((e) =>
          e.category === id ? { ...e, category: undefined } : e,
        ),
      });
    },
    [categories, expenses, setParams],
  );

  // --- DnD ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleTicketDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const reordered = reorderList(tickets, String(active.id), String(over.id));
      if (reordered) setParams({ tickets: reordered });
    },
    [tickets, setParams],
  );

  const handleRevenueDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const reordered = reorderList(
        revenues,
        String(active.id),
        String(over.id),
      );
      if (reordered) setParams({ revenues: reordered });
    },
    [revenues, setParams],
  );

  const handleExpenseDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const reordered = reorderList(
        expenses,
        String(active.id),
        String(over.id),
      );
      if (reordered) setParams({ expenses: reordered });
    },
    [expenses, setParams],
  );

  // --- Calculations ---
  const stats: BudgetStats = useMemo(() => {
    const totalAttendees = tickets.reduce((sum, t) => sum + t.quantity, 0);
    const maxCapacity = tickets.reduce(
      (sum, t) => sum + (t.maxQuantity || 0),
      0,
    );
    const ticketRevenue = tickets.reduce(
      (sum, t) => sum + t.price * t.quantity,
      0,
    );
    const otherRevenue = revenues.reduce((sum, r) => {
      const amountTTC = toTTC(r.amount, vatRate, r.isHT);
      if (r.perPerson) {
        return sum + amountTTC * (r.personCount ?? totalAttendees);
      }
      return sum + amountTTC;
    }, 0);
    const totalRevenue = ticketRevenue + otherRevenue;

    const fixedExpenses = expenses.reduce(
      (sum, e) => sum + (e.perPerson ? 0 : toTTC(e.amount, vatRate, e.isHT)),
      0,
    );
    const variableExpenses = expenses.reduce((sum, e) => {
      if (!e.perPerson) return sum;
      return (
        sum +
        toTTC(e.amount, vatRate, e.isHT) *
          (e.personCount ?? totalAttendees)
      );
    }, 0);
    const variableCostPerPerson = expenses.reduce(
      (sum, e) =>
        sum +
        (e.perPerson && e.personCount === undefined
          ? toTTC(e.amount, vatRate, e.isHT)
          : 0),
      0,
    );
    const totalExpenses = fixedExpenses + variableExpenses;

    const balance = totalRevenue - totalExpenses;
    const marginRate = totalRevenue > 0 ? (balance / totalRevenue) * 100 : 0;
    const costPerPerson =
      totalAttendees > 0 ? totalExpenses / totalAttendees : 0;
    const revenuePerPerson =
      totalAttendees > 0 ? totalRevenue / totalAttendees : 0;

    const totalTicketQuantity = tickets.reduce((sum, t) => sum + t.quantity, 0);
    const avgTicketPrice =
      totalTicketQuantity > 0
        ? ticketRevenue / totalTicketQuantity
        : tickets.length > 0
          ? tickets.reduce((sum, t) => sum + t.price, 0) / tickets.length
          : 0;

    const marginPerTicket = avgTicketPrice - variableCostPerPerson;
    const netFixedCosts = fixedExpenses - otherRevenue;

    let breakEvenTickets: number | null = null;
    if (marginPerTicket > 0) {
      breakEvenTickets = Math.ceil(netFixedCosts / marginPerTicket);
      if (breakEvenTickets < 0) breakEvenTickets = 0;
    } else if (netFixedCosts <= 0) {
      breakEvenTickets = 0;
    }

    const breakEvenReachable =
      maxCapacity === 0 ||
      (breakEvenTickets !== null && breakEvenTickets <= maxCapacity);

    return {
      totalAttendees,
      maxCapacity,
      ticketRevenue,
      otherRevenue,
      totalRevenue,
      totalExpenses,
      fixedExpenses,
      variableCostPerPerson,
      balance,
      marginRate,
      costPerPerson,
      revenuePerPerson,
      avgTicketPrice,
      breakEvenTickets,
      marginPerTicket,
      breakEvenReachable,
    };
  }, [tickets, revenues, expenses, vatRate]);

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const groups = new Map<string | undefined, typeof expenses>();
    for (const expense of expenses) {
      const categoryId = expense.category;
      if (!groups.has(categoryId)) groups.set(categoryId, []);
      groups.get(categoryId)!.push(expense);
    }
    return groups;
  }, [expenses]);

  return {
    eventName,
    tickets,
    revenues,
    expenses,
    categories,
    vatRate,
    editingRevenueId,
    editingExpenseId,
    copied,
    categoryDialogOpen,
    stats,
    expensesByCategory,
    sensors,
    setParams,
    setEditingRevenueId,
    setEditingExpenseId,
    setCategoryDialogOpen,
    handleShare,
    addTicket,
    updateTicket,
    removeTicket,
    addRevenue,
    updateRevenue,
    updateRevenueLabel,
    removeRevenue,
    addExpense,
    updateExpense,
    updateExpenseLabel,
    updateExpenseCategory,
    removeExpense,
    addCategory,
    removeCategory,
    handleTicketDragEnd,
    handleRevenueDragEnd,
    handleExpenseDragEnd,
  };
}
