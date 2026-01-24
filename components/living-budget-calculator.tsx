"use client";

import { useMemo, useCallback } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  Home,
  ShoppingCart,
  Car,
  Lightbulb,
  Heart,
  Smartphone,
  Gift,
  Banknote,
  TrendingUp,
  Euro,
} from "lucide-react";

// --- Types ---

interface InputField {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface IncomeState {
  salary1: string;
  salary2: string;
  aid: string;
  other: string;
}

interface FixedState {
  rent: string;
  loans: string;
  energy: string;
  insurance: string;
  subscriptions: string;
}

interface VariableState {
  groceries: string;
  transport: string;
  leisure: string;
  shopping: string;
  health: string;
}

// --- Constants ---

const INCOME_FIELDS: InputField[] = [
  { id: "salary1", label: "Salaire net 1", icon: Wallet },
  { id: "salary2", label: "Salaire net 2", icon: Wallet },
  { id: "aid", label: "Aides (CAF)", icon: Gift },
  { id: "other", label: "Autres revenus", icon: Banknote },
];

const FIXED_FIELDS: InputField[] = [
  { id: "rent", label: "Loyer / Crédit", icon: Home },
  { id: "loans", label: "Crédits", icon: Car },
  { id: "energy", label: "Énergie & eau", icon: Lightbulb },
  { id: "insurance", label: "Assurances", icon: Heart },
  { id: "subscriptions", label: "Abonnements", icon: Smartphone },
];

const VARIABLE_FIELDS: InputField[] = [
  { id: "groceries", label: "Alimentation", icon: ShoppingCart },
  { id: "transport", label: "Transports", icon: Car },
  { id: "leisure", label: "Loisirs", icon: TrendingUp },
  { id: "shopping", label: "Shopping", icon: ShoppingCart },
  { id: "health", label: "Santé", icon: Heart },
];

// --- Components ---

interface InputRowProps {
  field: InputField;
  value: string;
  onChange: (value: string) => void;
}

function InputRow({ field, value, onChange }: InputRowProps) {
  const Icon = field.icon;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
      </div>
      <Label className="flex-1 text-sm text-neutral-700 font-medium">
        {field.label}
      </Label>
      <InputGroup className="w-28 h-10">
        <InputGroupAddon>
          <Euro className="size-3.5" />
        </InputGroupAddon>
        <InputGroupInput
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-base font-medium bg-neutral-50 focus-visible:bg-white"
          placeholder="0"
        />
      </InputGroup>
    </div>
  );
}

// --- Main Component ---

export function FamilyBudgetPlanner() {
  const [params, setParams] = useQueryStates({
    // Incomes
    salary1: parseAsString.withDefault("2000"),
    salary2: parseAsString.withDefault("1800"),
    aid: parseAsString.withDefault("150"),
    other: parseAsString.withDefault("0"),
    // Fixed
    rent: parseAsString.withDefault("950"),
    loans: parseAsString.withDefault("200"),
    energy: parseAsString.withDefault("120"),
    insurance: parseAsString.withDefault("80"),
    subscriptions: parseAsString.withDefault("60"),
    // Variable
    groceries: parseAsString.withDefault("600"),
    transport: parseAsString.withDefault("150"),
    leisure: parseAsString.withDefault("200"),
    shopping: parseAsString.withDefault("100"),
    health: parseAsString.withDefault("50"),
  }, { history: "replace" });

  const incomes: IncomeState = {
    salary1: params.salary1,
    salary2: params.salary2,
    aid: params.aid,
    other: params.other,
  };

  const fixed: FixedState = {
    rent: params.rent,
    loans: params.loans,
    energy: params.energy,
    insurance: params.insurance,
    subscriptions: params.subscriptions,
  };

  const variable: VariableState = {
    groceries: params.groceries,
    transport: params.transport,
    leisure: params.leisure,
    shopping: params.shopping,
    health: params.health,
  };

  // --- Handlers ---

  const updateIncome = useCallback((field: keyof IncomeState, value: string) => {
    setParams({ [field]: value });
  }, [setParams]);

  const updateFixed = useCallback((field: keyof FixedState, value: string) => {
    setParams({ [field]: value });
  }, [setParams]);

  const updateVariable = useCallback((field: keyof VariableState, value: string) => {
    setParams({ [field]: value });
  }, [setParams]);

  // --- Calculations ---

  const stats = useMemo(() => {
    const sumValues = (values: string[]) =>
      values.reduce((acc, val) => acc + (Number(val) || 0), 0);

    const totalIncome = sumValues(Object.values(incomes));
    const totalFixed = sumValues(Object.values(fixed));
    const totalVariable = sumValues(Object.values(variable));
    const balance = totalIncome - totalFixed - totalVariable;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    return { totalIncome, totalFixed, totalVariable, balance, savingsRate };
  }, [incomes, fixed, variable]);

  // --- Formatters ---

  const formatCurrency = useCallback(
    (n: number) =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n),
    []
  );

  // --- Distribution data ---

  const distributionItems = useMemo(
    () => [
      {
        label: "Charges fixes",
        pct: stats.totalIncome > 0 ? (stats.totalFixed / stats.totalIncome) * 100 : 0,
        color: "bg-neutral-900",
      },
      {
        label: "Dépenses",
        pct: stats.totalIncome > 0 ? (stats.totalVariable / stats.totalIncome) * 100 : 0,
        color: "bg-neutral-400",
      },
      {
        label: "Épargne",
        pct: Math.max(0, stats.savingsRate),
        color: "bg-neutral-200",
      },
    ],
    [stats]
  );

  return (
    <div className="h-full grid lg:grid-cols-5 gap-6">
      {/* Left: Input Form */}
      <Card className="lg:col-span-3 border-0 shadow-sm bg-white overflow-hidden">
        <Tabs defaultValue="income" className="h-full flex flex-col">
          <div className="px-5 pt-5">
            <TabsList className="grid w-full grid-cols-3 bg-neutral-100 p-1 rounded-lg h-10">
              <TabsTrigger
                value="income"
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Revenus
              </TabsTrigger>
              <TabsTrigger
                value="fixed"
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Charges
              </TabsTrigger>
              <TabsTrigger
                value="variable"
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Dépenses
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="flex-1 p-5 overflow-auto">
            <TabsContent value="income" className="mt-0">
              {INCOME_FIELDS.map((field) => (
                <InputRow
                  key={field.id}
                  field={field}
                  value={incomes[field.id as keyof IncomeState]}
                  onChange={(v) => updateIncome(field.id as keyof IncomeState, v)}
                />
              ))}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-neutral-200">
                <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                  Total revenus
                </span>
                <span className="text-xl font-bold text-neutral-900 tabular-nums">
                  {formatCurrency(stats.totalIncome)}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="fixed" className="mt-0">
              {FIXED_FIELDS.map((field) => (
                <InputRow
                  key={field.id}
                  field={field}
                  value={fixed[field.id as keyof FixedState]}
                  onChange={(v) => updateFixed(field.id as keyof FixedState, v)}
                />
              ))}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-neutral-200">
                <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                  Total charges
                </span>
                <span className="text-xl font-bold text-neutral-900 tabular-nums">
                  {formatCurrency(stats.totalFixed)}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="variable" className="mt-0">
              {VARIABLE_FIELDS.map((field) => (
                <InputRow
                  key={field.id}
                  field={field}
                  value={variable[field.id as keyof VariableState]}
                  onChange={(v) => updateVariable(field.id as keyof VariableState, v)}
                />
              ))}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-neutral-200">
                <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">
                  Total dépenses
                </span>
                <span className="text-xl font-bold text-neutral-900 tabular-nums">
                  {formatCurrency(stats.totalVariable)}
                </span>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Right: Results */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Balance Card */}
        <div className="bg-neutral-900 rounded-2xl p-6 text-center flex-1 flex flex-col justify-center">
          <div className="text-xs text-neutral-400 uppercase tracking-widest">
            Capacité d&apos;épargne
          </div>
          <div
            className={`text-4xl font-bold mt-2 tabular-nums ${
              stats.balance < 0 ? "text-red-400" : "text-white"
            }`}
          >
            {formatCurrency(stats.balance)}
          </div>
          <div className="text-sm text-neutral-500 mt-1">par mois</div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-neutral-800">
            <div className="text-center">
              <div className="text-xs text-neutral-500">/ semaine</div>
              <div className="text-lg font-semibold text-neutral-200 tabular-nums">
                {formatCurrency(stats.balance / 4)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-neutral-500">/ jour</div>
              <div className="text-lg font-semibold text-neutral-200 tabular-nums">
                {formatCurrency(stats.balance / 30)}
              </div>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="space-y-3">
              {distributionItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-neutral-600 flex-1">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                    {Math.round(item.pct)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
