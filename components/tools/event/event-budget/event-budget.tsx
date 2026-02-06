"use client";

import { useMemo, useCallback, useState } from "react";
import { useQueryStates, parseAsString, parseAsJson, parseAsFloat } from "nuqs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  UserCheck,
  Target,
  AlertTriangle,
  Share2,
  Check,
  PieChartIcon,
  Percent,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  DEFAULT_EXPENSES,
  DEFAULT_REVENUES,
  DEFAULT_TICKETS,
  TicketType,
} from "./types";
import { validateExpenses, validateRevenues, validateTickets } from "./utils";
import { ExpenseRow } from "./expense-row";
import { SortableItem } from "./sortable-item";
import { RevenueRow } from "./revenue-row";
import { TicketRow } from "./ticket-row";

export function EventBudget() {
  const [params, setParams] = useQueryStates(
    {
      eventName: parseAsString.withDefault("Mon événement"),
      tickets: parseAsJson(validateTickets).withDefault(DEFAULT_TICKETS),
      revenues: parseAsJson(validateRevenues).withDefault(DEFAULT_REVENUES),
      expenses: parseAsJson(validateExpenses).withDefault(DEFAULT_EXPENSES),
      vatRate: parseAsFloat.withDefault(20),
    },
    { history: "replace" },
  );

  const { eventName, tickets, revenues, expenses, vatRate } = params;

  // Convert HT to TTC for items marked as HT
  const toTTC = useCallback(
    (amount: number, isHT?: boolean) => (isHT ? amount * (1 + vatRate / 100) : amount),
    [vatRate],
  );

  const [editingRevenueId, setEditingRevenueId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    // Build URL with current params to ensure it's up to date
    const url = new URL(window.location.href);
    url.searchParams.set("eventName", eventName);
    url.searchParams.set("tickets", JSON.stringify(tickets));
    url.searchParams.set("revenues", JSON.stringify(revenues));
    url.searchParams.set("expenses", JSON.stringify(expenses));
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
  }, [eventName, tickets, revenues, expenses, vatRate]);

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

  const removeExpense = useCallback(
    (id: string) => {
      setParams({ expenses: expenses.filter((e) => e.id !== id) });
    },
    [expenses, setParams],
  );

  // --- Reorder handlers ---
  const reorderTickets = useCallback(
    (activeId: string, overId: string) => {
      const oldIndex = tickets.findIndex((t) => t.id === activeId);
      const newIndex = tickets.findIndex((t) => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        setParams({ tickets: arrayMove(tickets, oldIndex, newIndex) });
      }
    },
    [tickets, setParams],
  );

  const reorderRevenues = useCallback(
    (activeId: string, overId: string) => {
      const oldIndex = revenues.findIndex((r) => r.id === activeId);
      const newIndex = revenues.findIndex((r) => r.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        setParams({ revenues: arrayMove(revenues, oldIndex, newIndex) });
      }
    },
    [revenues, setParams],
  );

  const reorderExpenses = useCallback(
    (activeId: string, overId: string) => {
      const oldIndex = expenses.findIndex((e) => e.id === activeId);
      const newIndex = expenses.findIndex((e) => e.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        setParams({ expenses: arrayMove(expenses, oldIndex, newIndex) });
      }
    },
    [expenses, setParams],
  );

  // --- DnD sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleTicketDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        reorderTickets(String(active.id), String(over.id));
      }
    },
    [reorderTickets],
  );

  const handleRevenueDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        reorderRevenues(String(active.id), String(over.id));
      }
    },
    [reorderRevenues],
  );

  const handleExpenseDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        reorderExpenses(String(active.id), String(over.id));
      }
    },
    [reorderExpenses],
  );

  // --- Calculations ---
  const stats = useMemo(() => {
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
      const amountTTC = toTTC(r.amount, r.isHT);
      if (r.perPerson) {
        const effectiveCount = r.personCount ?? totalAttendees;
        return sum + amountTTC * effectiveCount;
      }
      return sum + amountTTC;
    }, 0);
    const totalRevenue = ticketRevenue + otherRevenue;

    const fixedExpenses = expenses.reduce(
      (sum, e) => sum + (e.perPerson ? 0 : toTTC(e.amount, e.isHT)),
      0,
    );
    const variableExpenses = expenses.reduce((sum, e) => {
      if (!e.perPerson) return sum;
      const effectiveCount = e.personCount ?? totalAttendees;
      return sum + toTTC(e.amount, e.isHT) * effectiveCount;
    }, 0);
    const variableCostPerPerson = expenses.reduce(
      (sum, e) =>
        sum + (e.perPerson && e.personCount === undefined ? toTTC(e.amount, e.isHT) : 0),
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
  }, [tickets, revenues, expenses, toTTC]);

  const formatCurrency = useCallback(
    (n: number) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n),
    [],
  );

  // Chart colors
  const EXPENSE_COLORS = [
    "#f87171",
    "#fb923c",
    "#fbbf24",
    "#a3e635",
    "#34d399",
    "#22d3d8",
    "#60a5fa",
    "#a78bfa",
    "#f472b6",
    "#fb7185",
  ];

  const expenseChartData = useMemo(() => {
    return expenses
      .map((e) => {
        const effectiveCount = e.personCount ?? stats.totalAttendees;
        const amountTTC = toTTC(e.amount, e.isHT);
        const total = e.perPerson ? amountTTC * effectiveCount : amountTTC;
        return {
          name: e.label || "Sans nom",
          value: total,
        };
      })
      .filter((e) => e.value > 0);
  }, [expenses, stats.totalAttendees, toTTC]);

  return (
    <div className="h-full grid lg:grid-cols-5 gap-4">
      {/* Left: Input Form */}
      <Card className="lg:col-span-3 overflow-hidden">
        <Tabs defaultValue="tickets" className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setParams({ eventName: e.target.value })}
                className="flex-1 text-base font-semibold bg-transparent outline-none"
                placeholder="Nom de l'événement"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Partager
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-neutral-400">Taux TVA :</span>
              <div className="flex items-center h-7 rounded-lg bg-neutral-100 px-2">
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setParams({ vatRate: Number(e.target.value) || 0 })}
                  className="w-10 bg-transparent text-center text-[11px] font-medium outline-none"
                  min={0}
                  max={100}
                />
                <Percent className="w-3 h-3 text-neutral-400" />
              </div>
              <span className="text-neutral-400 text-[10px]">
                (pour conversion HT → TTC)
              </span>
            </div>

            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tickets">
                <Ticket className="w-4 h-4 mr-1.5 text-emerald-500" />
                Billetterie
              </TabsTrigger>
              <TabsTrigger value="revenue">
                <TrendingUp className="w-4 h-4 mr-1.5 text-blue-500" />
                Recettes
              </TabsTrigger>
              <TabsTrigger value="expenses">
                <TrendingDown className="w-4 h-4 mr-1.5 text-red-400" />
                Dépenses
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="flex-1 overflow-auto">
            <TabsContent value="tickets">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTicketDragEnd}
              >
                <SortableContext
                  items={tickets.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tickets.map((ticket) => (
                    <SortableItem key={ticket.id} id={ticket.id}>
                      <TicketRow
                        ticket={ticket}
                        onUpdate={(field, value) =>
                          updateTicket(ticket.id, field, value)
                        }
                        onRemove={() => removeTicket(ticket.id)}
                        canRemove={tickets.length > 1}
                      />
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>

              <Button
                variant="ghost"
                size="sm"
                onClick={addTicket}
                className="w-full mt-2"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter un billet
              </Button>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-neutral-200">
                <div className="flex items-center gap-3 text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium tabular-nums">
                      {stats.totalAttendees}
                      {stats.maxCapacity > 0 && (
                        <span className="text-neutral-400">
                          {" "}
                          / {stats.maxCapacity}
                        </span>
                      )}
                    </span>
                  </div>
                  {stats.maxCapacity > 0 &&
                    stats.totalAttendees > stats.maxCapacity && (
                      <span className="text-[10px] text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Dépassement
                      </span>
                    )}
                </div>
                <span className="text-lg font-bold text-emerald-600 tabular-nums">
                  {formatCurrency(stats.ticketRevenue)}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="revenue">
              <div className="mb-2 pb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <Ticket className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Billetterie</span>
                  <span className="ml-auto font-semibold text-emerald-600 tabular-nums">
                    {formatCurrency(stats.ticketRevenue)}
                  </span>
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleRevenueDragEnd}
              >
                <SortableContext
                  items={revenues.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {revenues.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      <RevenueRow
                        item={item}
                        totalAttendees={stats.totalAttendees}
                        vatRate={vatRate}
                        isEditing={editingRevenueId === item.id}
                        onUpdate={(field, value) =>
                          updateRevenue(item.id, field, value)
                        }
                        onRemove={() => removeRevenue(item.id)}
                        onLabelChange={(label) =>
                          updateRevenueLabel(item.id, label)
                        }
                        onEditingChange={(editing) =>
                          setEditingRevenueId(editing ? item.id : null)
                        }
                      />
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>

              <Button
                variant="ghost"
                size="sm"
                onClick={addRevenue}
                className="w-full mt-2"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter une recette
              </Button>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">
                  Total
                </span>
                <span className="text-lg font-bold text-emerald-600 tabular-nums">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="expenses">
              <div className="mb-2 pb-1 border-b border-neutral-200">
                <span className="text-[10px] text-neutral-400">
                  <span className="inline-flex items-center px-1 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                    /pers
                  </span>{" "}
                  × {stats.totalAttendees} pers.
                </span>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleExpenseDragEnd}
              >
                <SortableContext
                  items={expenses.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {expenses.map((item) => (
                    <SortableItem key={item.id} id={item.id}>
                      <ExpenseRow
                        item={item}
                        totalAttendees={stats.totalAttendees}
                        vatRate={vatRate}
                        isEditing={editingExpenseId === item.id}
                        onUpdate={(field, value) =>
                          updateExpense(item.id, field, value)
                        }
                        onRemove={() => removeExpense(item.id)}
                        onLabelChange={(label) =>
                          updateExpenseLabel(item.id, label)
                        }
                        onEditingChange={(editing) =>
                          setEditingExpenseId(editing ? item.id : null)
                        }
                      />
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>

              <Button
                variant="ghost"
                size="sm"
                onClick={addExpense}
                className="w-full mt-2"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Ajouter une dépense
              </Button>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">
                  Total
                </span>
                <span className="text-lg font-bold text-red-500 tabular-nums">
                  {formatCurrency(stats.totalExpenses)}
                </span>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Right: Results */}
      <div className="lg:col-span-2 flex flex-col gap-3 min-h-0 overflow-auto">
        {/* Balance Card */}
        <div
          className={`rounded-xl p-4 text-center shrink-0 ${
            stats.balance >= 0 ? "bg-emerald-900" : "bg-red-900"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <PiggyBank className="w-4 h-4 text-white/60" />
            <span className="text-[10px] text-white/60 uppercase tracking-widest">
              Solde prévisionnel
            </span>
          </div>
          <div
            className={`text-2xl font-bold tabular-nums mt-1 ${
              stats.balance < 0 ? "text-red-300" : "text-white"
            }`}
          >
            {stats.balance >= 0 ? "+" : ""}
            {formatCurrency(stats.balance)}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
            <div>
              <div className="text-[10px] text-white/50">Marge</div>
              <div
                className={`text-sm font-semibold tabular-nums ${
                  stats.marginRate >= 0 ? "text-emerald-200" : "text-red-200"
                }`}
              >
                {stats.marginRate.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/50">Participants</div>
              <div className="text-sm font-semibold text-white/90 tabular-nums">
                {stats.totalAttendees}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/50">Marge/pers</div>
              <div className="text-sm font-semibold text-white/90 tabular-nums">
                {formatCurrency(stats.revenuePerPerson - stats.costPerPerson)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-neutral-600">Recettes</span>
                </div>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-neutral-600">Dépenses</span>
                </div>
                <span className="font-semibold text-neutral-900 tabular-nums">
                  {formatCurrency(stats.totalExpenses)}
                </span>
              </div>
            </div>

            {stats.totalRevenue > 0 && (
              <div className="mt-3">
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-red-400 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (stats.totalExpenses / stats.totalRevenue) * 100)}%`,
                    }}
                  />
                  {stats.balance > 0 && (
                    <div
                      className="bg-emerald-500 transition-all duration-300"
                      style={{
                        width: `${(stats.balance / stats.totalRevenue) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expenses Chart */}
        {expenseChartData.length > 0 && (
          <Card>
            <CardContent>
              <div className="flex items-center gap-1.5 mb-2">
                <PieChartIcon className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">
                  Répartition des dépenses
                </span>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                {expenseChartData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          EXPENSE_COLORS[index % EXPENSE_COLORS.length],
                      }}
                    />
                    <span className="truncate text-neutral-600">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Break-even Card */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">
                Seuil de rentabilité
              </span>
            </div>

            {stats.breakEvenTickets !== null ? (
              <div className="flex items-center gap-3">
                <div
                  className={`text-center py-2 px-3 rounded-lg ${!stats.breakEvenReachable ? "bg-red-50" : "bg-amber-50"}`}
                >
                  <div
                    className={`text-xl font-bold tabular-nums ${!stats.breakEvenReachable ? "text-red-600" : "text-amber-600"}`}
                  >
                    {stats.breakEvenTickets}
                  </div>
                  <div
                    className={`text-[10px] ${!stats.breakEvenReachable ? "text-red-700/70" : "text-amber-700/70"}`}
                  >
                    {stats.maxCapacity > 0
                      ? `/ ${stats.maxCapacity}`
                      : "places"}
                  </div>
                </div>

                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Prix moy.</span>
                    <span className="font-medium text-neutral-700 tabular-nums">
                      {formatCurrency(stats.avgTicketPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Marge/billet</span>
                    <span
                      className={`font-medium tabular-nums ${
                        stats.marginPerTicket >= 0
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {formatCurrency(stats.marginPerTicket)}
                    </span>
                  </div>
                  {!stats.breakEvenReachable && stats.maxCapacity > 0 && (
                    <div className="pt-1 flex items-center gap-1 text-red-500">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-[10px]">Capacité insuffisante</span>
                    </div>
                  )}
                  {stats.breakEvenReachable &&
                    stats.totalAttendees > 0 &&
                    stats.breakEvenTickets > 0 && (
                      <div className="pt-1">
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              stats.totalAttendees >= stats.breakEvenTickets
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                            style={{
                              width: `${Math.min(100, (stats.totalAttendees / stats.breakEvenTickets) * 100)}%`,
                            }}
                          />
                        </div>
                        <p
                          className={`mt-1 text-[10px] ${
                            stats.totalAttendees >= stats.breakEvenTickets
                              ? "text-emerald-600"
                              : "text-neutral-500"
                          }`}
                        >
                          {stats.totalAttendees >= stats.breakEvenTickets
                            ? "Rentable !"
                            : `Encore ${stats.breakEvenTickets - stats.totalAttendees} à vendre`}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            ) : stats.marginPerTicket <= 0 &&
              stats.fixedExpenses > stats.otherRevenue ? (
              <div className="text-center py-2 px-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600">
                  Prix trop bas pour être rentable
                </p>
              </div>
            ) : (
              <div className="text-center py-2 px-3 rounded-lg">
                <p className="text-xs text-neutral-500">
                  Configurez les billets
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
