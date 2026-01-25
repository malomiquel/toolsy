"use client";

import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Euro, User, Users, CreditCard } from "lucide-react";

export interface IncomeData {
  salary1: string;
  salary2: string;
  otherIncome: string;
  existingLoans: string;
}

interface IncomeSectionProps {
  income: IncomeData;
  onChange: (income: IncomeData) => void;
}

export function IncomeSection({ income, onChange }: IncomeSectionProps) {
  const updateField = (field: keyof IncomeData, value: string) => {
    onChange({ ...income, [field]: value });
  };

  const totalIncome =
    (Number(income.salary1) || 0) +
    (Number(income.salary2) || 0) +
    (Number(income.otherIncome) || 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-neutral-500 uppercase tracking-wide">
          Revenus du foyer
        </Label>
        <span className="text-xs font-medium text-neutral-700">
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(totalIncome)}
          /mois
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

        <InputGroup className="h-10">
          <InputGroupAddon>
            <CreditCard className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            type="number"
            value={income.existingLoans}
            onChange={(e) => updateField("existingLoans", e.target.value)}
            className="text-sm"
            placeholder="Crédits en cours (optionnel)"
          />
          <InputGroupAddon align="inline-end">
            <Euro className="size-3.5" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

export function calculateTotalIncome(income: IncomeData): number {
  return (
    (Number(income.salary1) || 0) +
    (Number(income.salary2) || 0) +
    (Number(income.otherIncome) || 0)
  );
}

export function calculateExistingLoans(income: IncomeData): number {
  return Number(income.existingLoans) || 0;
}
