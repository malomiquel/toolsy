"use client";

import { useEffect, useRef } from "react";
import { ExpenseItem, RevenueItem, ExpenseCategory, ICON_MAP } from "./types";
import { Coins, Euro, Lock, MoreHorizontal, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { CategorySelector } from "./category-selector";

type BudgetRowBaseProps = {
  item: ExpenseItem | RevenueItem;
  totalAttendees: number;
  vatRate: number;
  isEditing?: boolean;
  onUpdate: (
    field: "amount" | "perPerson" | "personCount" | "isHT",
    value: number | boolean | undefined,
  ) => void;
  onRemove?: () => void;
  onLabelChange?: (label: string) => void;
  onEditingChange?: (editing: boolean) => void;
};

type ExpenseRowProps = BudgetRowBaseProps & {
  variant: "expense";
  categories: ExpenseCategory[];
  onCategoryChange?: (categoryId: string | null | undefined) => void;
};

type RevenueRowProps = BudgetRowBaseProps & {
  variant: "revenue";
};

type BudgetRowProps = ExpenseRowProps | RevenueRowProps;

const VARIANT_CONFIG = {
  expense: {
    defaultIcon: MoreHorizontal,
    perPersonColor: "text-blue-600",
    totalColor: "text-red-500",
    fixedTitle: "Coût fixe total",
    perPersonTitle: "Coût par personne",
  },
  revenue: {
    defaultIcon: Coins,
    perPersonColor: "text-emerald-600",
    totalColor: "text-emerald-600",
    fixedTitle: "Montant fixe total",
    perPersonTitle: "Montant par personne",
  },
} as const;

export function BudgetRow(props: BudgetRowProps) {
  const {
    item,
    totalAttendees,
    vatRate,
    isEditing,
    onUpdate,
    onRemove,
    onLabelChange,
    onEditingChange,
    variant,
  } = props;

  const config = VARIANT_CONFIG[variant];
  const Icon = ICON_MAP[item.iconKey] || config.defaultIcon;
  const effectivePersonCount = item.personCount ?? totalAttendees;
  const amountTTC = item.isHT ? item.amount * (1 + vatRate / 100) : item.amount;
  const calculatedTotal = item.perPerson
    ? amountTTC * effectivePersonCount
    : amountTTC;
  const inputRef = useRef<HTMLInputElement>(null);
  const showInput = !item.isDefault && (isEditing || !item.label);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  return (
    <div className="flex items-center gap-2 py-2 border-b border-neutral-100 last:border-0">
      <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-neutral-500" strokeWidth={1.5} />
      </div>

      {showInput ? (
        <Input
          ref={inputRef}
          type="text"
          value={item.label}
          onChange={(e) => {
            if (!isEditing) onEditingChange?.(true);
            onLabelChange?.(e.target.value);
          }}
          onBlur={() => onEditingChange?.(false)}
          onKeyDown={(e) => e.key === "Enter" && onEditingChange?.(false)}
          placeholder="Libellé..."
          className="flex-1 min-w-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => !item.isDefault && onEditingChange?.(true)}
          className="flex-1 min-w-0 truncate text-left text-sm text-neutral-700 hover:text-neutral-900"
        >
          {item.label}
        </button>
      )}

      {variant === "expense" && (
        <CategorySelector
          categories={props.categories}
          selectedCategoryId={(item as ExpenseItem).category}
          onSelect={(categoryId) =>
            props.onCategoryChange?.(
              categoryId === "none" ? undefined : categoryId,
            )
          }
        />
      )}

      <div className="shrink-0 flex h-7 rounded-lg bg-neutral-100 p-0.5">
        <button
          type="button"
          onClick={() => onUpdate("perPerson", false)}
          className={`flex items-center gap-1 px-2 rounded-md text-[11px] font-medium transition-all ${
            !item.perPerson
              ? "bg-white text-neutral-700 shadow-sm"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
          title={config.fixedTitle}
        >
          <Lock className="w-3 h-3" />
          Fixe
        </button>
        <button
          type="button"
          onClick={() => onUpdate("perPerson", true)}
          className={`flex items-center gap-1 px-2 rounded-md text-[11px] font-medium transition-all ${
            item.perPerson
              ? `bg-white ${config.perPersonColor} shadow-sm`
              : "text-neutral-400 hover:text-neutral-600"
          }`}
          title={config.perPersonTitle}
        >
          <Users className="w-3 h-3" />
          /pers
        </button>
      </div>

      <InputGroup className="w-20 shrink-0">
        <InputGroupAddon>
          <Euro className="size-3" />
        </InputGroupAddon>
        <InputGroupInput
          type="number"
          value={item.amount || ""}
          onChange={(e) => onUpdate("amount", Number(e.target.value) || 0)}
          placeholder="0"
        />
      </InputGroup>

      <button
        type="button"
        onClick={() => onUpdate("isHT", !item.isHT)}
        className={`shrink-0 px-1.5 h-6 rounded text-[10px] font-medium transition-colors ${
          item.isHT
            ? "bg-amber-100 text-amber-700"
            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
        }`}
        title={item.isHT ? "Prix HT (sera converti en TTC)" : "Prix TTC"}
      >
        {item.isHT ? "HT" : "TTC"}
      </button>

      {item.perPerson && (
        <>
          <InputGroup className="w-16 shrink-0">
            <InputGroupAddon>
              <Users className="size-3" />
            </InputGroupAddon>
            <InputGroupInput
              type="number"
              value={item.personCount ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate(
                  "personCount",
                  val === "" ? undefined : Number(val) || 0,
                );
              }}
              placeholder={String(totalAttendees)}
            />
          </InputGroup>
          <div className="w-16 text-right shrink-0">
            <span className="text-[10px] text-neutral-400">= </span>
            <span
              className={`text-xs font-semibold tabular-nums ${config.totalColor}`}
            >
              {calculatedTotal.toLocaleString("fr-FR")} €
            </span>
          </div>
        </>
      )}

      {onRemove && (
        <Button variant="ghost" size="icon-xs" onClick={onRemove}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
