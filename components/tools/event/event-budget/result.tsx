"use client";

import { useMemo } from "react";
import { PiggyBank, Target, AlertTriangle, PieChartIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { BudgetStats, ExpenseItem, ExpenseCategory } from "./types";
import { formatCurrency, toTTC } from "./utils";

interface ResultProps {
  vatRate: number;
  stats: BudgetStats;
  expenses: ExpenseItem[];
  categories: ExpenseCategory[];
}

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

export const Result = ({
  vatRate,
  stats,
  expenses,
  categories,
}: ResultProps) => {
  const expenseChartData = useMemo(() => {
    const totalsByCategory: Record<string, number> = {};

    for (const e of expenses) {
      const effectiveCount = e.personCount ?? stats.totalAttendees;
      const amountTTC = toTTC(e.amount, vatRate, e.isHT);
      const total = e.perPerson ? amountTTC * effectiveCount : amountTTC;

      if (total <= 0) continue;

      const categoryId = e.category || "uncategorized";

      if (!totalsByCategory[categoryId]) {
        totalsByCategory[categoryId] = 0;
      }

      totalsByCategory[categoryId] += total;
    }

    return Object.entries(totalsByCategory)
      .map(([categoryId, total]) => {
        const category = categories.find((c) => c.id === categoryId);

        return {
          name: category?.name || "Sans catégorie",
          value: total,
        };
      })
      .toSorted((a, b) => b.value - a.value);
  }, [expenses, stats.totalAttendees, categories, vatRate]);

  return (
    <div className="lg:col-span-2 flex flex-col gap-3 min-h-0 overflow-auto">
      {/* Balance Card */}
      <div
        className={`rounded-xl p-4 text-center shrink-0 ${
          stats.balance >= 0 ? "bg-emerald-900" : "bg-red-900"
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <PiggyBank className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60 uppercase tracking-widest">
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
            <div className="text-xs text-white/50">Marge</div>
            <div
              className={`text-sm font-semibold tabular-nums ${
                stats.marginRate >= 0 ? "text-emerald-200" : "text-red-200"
              }`}
            >
              {stats.marginRate.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-white/50">Participants</div>
            <div className="text-sm font-semibold text-white/90 tabular-nums">
              {stats.totalAttendees}
            </div>
          </div>
          <div>
            <div className="text-xs text-white/50">Marge/pers</div>
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

      {expenseChartData && expenseChartData.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-1.5 mb-2">
              <PieChartIcon className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
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

      <Card>
        <CardContent>
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
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
                  className={`text-xs ${!stats.breakEvenReachable ? "text-red-700/70" : "text-amber-700/70"}`}
                >
                  {stats.maxCapacity > 0 ? `/ ${stats.maxCapacity}` : "places"}
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
                    <span className="text-xs">Capacité insuffisante</span>
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
                        className={`mt-1 text-xs ${
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
  );
};
