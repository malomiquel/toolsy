"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
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
  UserCheck,
  AlertTriangle,
  Share2,
  Check,
  Percent,
} from "lucide-react";
import { useBudgetState } from "./use-budget-state";
import { formatCurrency, toTTC } from "./utils";
import { BudgetRow } from "./budget-row";
import { SortableItem } from "./sortable-item";
import { TicketRow } from "./ticket-row";
import { CategoryDialog } from "./category-dialog";
import { Result } from "./result";

export function EventBudget() {
  const {
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
  } = useBudgetState();

  return (
    <div className="h-full grid lg:grid-cols-5 gap-4">
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
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="outline" size="sm" onClick={handleShare}>
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
            </div>

            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-neutral-400">Taux TVA :</span>
              <div className="flex items-center h-7 rounded-lg bg-neutral-100 px-2">
                <input
                  type="number"
                  value={vatRate}
                  onChange={(e) =>
                    setParams({ vatRate: Number(e.target.value) || 0 })
                  }
                  className="w-10 bg-transparent text-center text-[11px] font-medium outline-none"
                  min={0}
                  max={100}
                />
                <Percent className="w-3 h-3 text-neutral-400" />
              </div>
              <span className="text-neutral-400 text-xs">
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
            {/* Tickets Tab */}
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
                      <span className="text-xs text-red-500 flex items-center gap-1">
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

            {/* Revenue Tab */}
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
                      <BudgetRow
                        variant="revenue"
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
                <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                  Total
                </span>
                <span className="text-lg font-bold text-emerald-600 tabular-nums">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent
              value="expenses"
              className="flex flex-col h-full min-h-0"
            >
              <div className="mb-2 pb-1 border-b border-neutral-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-neutral-400">
                  <span className="inline-flex items-center px-1 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                    /pers
                  </span>{" "}
                  × {stats.totalAttendees} pers.
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCategoryDialogOpen(true)}
                  className="h-6 text-xs px-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Gérer les catégories
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleExpenseDragEnd}
                >
                  <SortableContext
                    items={expenses.map((e) => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {[...expensesByCategory.entries()].map(
                      ([categoryId, categoryExpenses]) => {
                        const category = categories.find(
                          (c) => c.id === categoryId,
                        );
                        const categoryTotal = categoryExpenses.reduce(
                          (sum, e) => {
                            const amountTTC = toTTC(
                              e.amount,
                              vatRate,
                              e.isHT,
                            );
                            const effectiveCount =
                              e.personCount ?? stats.totalAttendees;
                            return (
                              sum +
                              (e.perPerson
                                ? amountTTC * effectiveCount
                                : amountTTC)
                            );
                          },
                          0,
                        );

                        return (
                          <div
                            key={categoryId || "uncategorized"}
                            className="mb-3"
                          >
                            {category && (
                              <div className="flex items-center gap-2 mb-1.5 px-1">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wide">
                                  {category.name}
                                </span>
                                {categoryTotal > 0 && (
                                  <span className="ml-auto text-xs font-semibold text-red-500 tabular-nums">
                                    {formatCurrency(categoryTotal)}
                                  </span>
                                )}
                              </div>
                            )}
                            {!category && categoryExpenses.length > 0 && (
                              <div className="flex items-center gap-2 mb-1.5 px-1">
                                <div className="w-2 h-2 rounded-full bg-neutral-300" />
                                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                                  Sans catégorie
                                </span>
                                {categoryTotal > 0 && (
                                  <span className="ml-auto text-xs font-semibold text-red-500 tabular-nums">
                                    {formatCurrency(categoryTotal)}
                                  </span>
                                )}
                              </div>
                            )}
                            {categoryExpenses.map((item) => (
                              <SortableItem key={item.id} id={item.id}>
                                <BudgetRow
                                  variant="expense"
                                  item={item}
                                  totalAttendees={stats.totalAttendees}
                                  vatRate={vatRate}
                                  categories={categories}
                                  isEditing={editingExpenseId === item.id}
                                  onUpdate={(field, value) =>
                                    updateExpense(item.id, field, value)
                                  }
                                  onRemove={() => removeExpense(item.id)}
                                  onLabelChange={(label) =>
                                    updateExpenseLabel(item.id, label)
                                  }
                                  onCategoryChange={(category) =>
                                    updateExpenseCategory(item.id, category)
                                  }
                                  onEditingChange={(editing) =>
                                    setEditingExpenseId(
                                      editing ? item.id : null,
                                    )
                                  }
                                />
                              </SortableItem>
                            ))}
                          </div>
                        );
                      },
                    )}
                  </SortableContext>
                </DndContext>
              </div>

              <div className="shrink-0">
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
                  <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                    Total
                  </span>
                  <span className="text-lg font-bold text-red-500 tabular-nums">
                    {formatCurrency(stats.totalExpenses)}
                  </span>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Result
        stats={stats}
        expenses={expenses}
        categories={categories}
        vatRate={vatRate}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        categories={categories}
        onAddCategory={addCategory}
        onRemoveCategory={removeCategory}
      />
    </div>
  );
}
