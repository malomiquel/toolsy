"use client";

import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Euro, User, Users, CreditCard, Plus, X } from "lucide-react";

export interface IncomeData {
  salary1: string;
  salary2: string;
  otherIncome: string;
  existingLoans: string[];
  incomeType: "monthly" | "annual";
}

interface IncomeSectionProps {
  income: IncomeData;
  onChange: (income: IncomeData) => void;
}

export function IncomeSection({ income, onChange }: IncomeSectionProps) {
  const updateField = (field: keyof IncomeData, value: string) => {
    onChange({ ...income, [field]: value });
  };

  const isAnnual = income.incomeType === "annual";

  const totalIncome =
    (Number(income.salary1) || 0) +
    (Number(income.salary2) || 0) +
    (Number(income.otherIncome) || 0);

  const monthlyIncome = isAnnual ? totalIncome / 12 : totalIncome;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-neutral-500 uppercase tracking-wide">
          Revenus du foyer
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-700">
            {new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            }).format(monthlyIncome)}
            /mois
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pb-1">
        <span className={`text-xs ${!isAnnual ? "font-medium text-neutral-700" : "text-neutral-400"}`}>
          Mois
        </span>
        <Switch
          size="sm"
          checked={isAnnual}
          onCheckedChange={(checked) =>
            updateField("incomeType", checked ? "annual" : "monthly")
          }
        />
        <span className={`text-xs ${isAnnual ? "font-medium text-neutral-700" : "text-neutral-400"}`}>
          An
        </span>
      </div>

      <div className="space-y-2">
        <InputGroup className="h-10">
          <InputGroupAddon>
            <User className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            type="number"
            value={income.salary1}
            onChange={(e) => updateField("salary1", e.target.value)}
            className="text-sm"
            placeholder="Salaire 1"
          />
          <InputGroupAddon align="inline-end">
            <Euro className="size-3.5" />
          </InputGroupAddon>
        </InputGroup>

        <InputGroup className="h-10">
          <InputGroupAddon>
            <Users className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            type="number"
            value={income.salary2}
            onChange={(e) => updateField("salary2", e.target.value)}
            className="text-sm"
            placeholder="Salaire 2 (optionnel)"
          />
          <InputGroupAddon align="inline-end">
            <Euro className="size-3.5" />
          </InputGroupAddon>
        </InputGroup>

        <InputGroup className="h-10">
          <InputGroupAddon>
            <Euro className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            type="number"
            value={income.otherIncome}
            onChange={(e) => updateField("otherIncome", e.target.value)}
            className="text-sm"
            placeholder="Autres revenus (optionnel)"
          />
        </InputGroup>

      </div>

      {/* Section Crédits existants */}
      <div className="pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-neutral-500 uppercase tracking-wide">
            Crédits en cours
          </Label>
          <Button
            onClick={() => {
              const newLoans = [...income.existingLoans, ""];
              onChange({ ...income, existingLoans: newLoans });
            }}
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs"
          >
            <Plus className="size-3.5" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          {income.existingLoans.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-2">
              Aucun crédit en cours
            </p>
          ) : (
            income.existingLoans.map((loan, index) => (
              <div key={index} className="flex gap-2">
                <InputGroup className="h-10 flex-1">
                  <InputGroupAddon>
                    <CreditCard className="size-3.5" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="number"
                    value={loan}
                    onChange={(e) => {
                      const newLoans = [...income.existingLoans];
                      newLoans[index] = e.target.value;
                      onChange({ ...income, existingLoans: newLoans });
                    }}
                    className="text-sm"
                    placeholder={`Crédit ${index + 1}`}
                  />
                  <InputGroupAddon align="inline-end">
                    <Euro className="size-3.5" />
                  </InputGroupAddon>
                </InputGroup>
                <Button
                  onClick={() => {
                    const newLoans = income.existingLoans.filter(
                      (_, i) => i !== index
                    );
                    onChange({ ...income, existingLoans: newLoans });
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-10 w-10 p-0"
                >
                  <X className="size-4 text-neutral-400" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function calculateTotalIncome(income: IncomeData): number {
  const total =
    (Number(income.salary1) || 0) +
    (Number(income.salary2) || 0) +
    (Number(income.otherIncome) || 0);

  // Si le type est annuel, on divise par 12 pour obtenir le mensuel
  return income.incomeType === "annual" ? total / 12 : total;
}

export function calculateExistingLoans(income: IncomeData): number {
  return income.existingLoans.reduce(
    (sum, loan) => sum + (Number(loan) || 0),
    0
  );
}
