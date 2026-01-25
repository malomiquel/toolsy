"use client";

import { useMemo } from "react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Euro, Percent, Calendar, Home, TrendingUp } from "lucide-react";
import {
  IncomeSection,
  calculateTotalIncome,
  calculateExistingLoans,
  type IncomeData,
} from "./income-section";
import { DebtRatioIndicator } from "./debt-ratio-indicator";

interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  insuranceCost: number;
  totalCost: number;
}

export function MortgageCalculator() {
  const [params, setParams] = useQueryStates({
    amount: parseAsString.withDefault("250000"),
    duration: parseAsInteger.withDefault(20),
    rate: parseAsString.withDefault("3.5"),
    insuranceRate: parseAsString.withDefault("0.34"),
    // Income section
    salary1: parseAsString.withDefault("2500"),
    salary2: parseAsString.withDefault(""),
    otherIncome: parseAsString.withDefault(""),
    existingLoans: parseAsString.withDefault(""),
  }, { history: "replace" });

  const { amount, duration, rate, insuranceRate } = params;

  const income: IncomeData = {
    salary1: params.salary1,
    salary2: params.salary2,
    otherIncome: params.otherIncome,
    existingLoans: params.existingLoans,
  };

  const setIncome = (newIncome: IncomeData) => {
    setParams({
      salary1: newIncome.salary1,
      salary2: newIncome.salary2,
      otherIncome: newIncome.otherIncome,
      existingLoans: newIncome.existingLoans,
    });
  };

  const totalIncome = calculateTotalIncome(income);
  const existingLoans = calculateExistingLoans(income);

  const result = useMemo<MortgageResult | null>(() => {
    const principal = Number.parseFloat(amount) || 0;
    const years = duration;
    const annualRate = Number.parseFloat(rate) || 0;
    const annualInsurance = Number.parseFloat(insuranceRate) || 0;

    if (principal <= 0 || years <= 0 || annualRate <= 0) return null;

    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    // Formule de calcul de la mensualité
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;

    // Assurance (calculée sur le capital initial)
    const monthlyInsurance = (principal * (annualInsurance / 100)) / 12;
    const insuranceCost = monthlyInsurance * numberOfPayments;

    return {
      monthlyPayment: monthlyPayment + monthlyInsurance,
      totalPayment,
      totalInterest,
      insuranceCost,
      totalCost: totalPayment + insuranceCost,
    };
  }, [amount, duration, rate, insuranceRate]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  const formatCurrencyDetailed = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(n);

  // Distribution pour le graphique
  const distribution = useMemo(() => {
    if (!result) return { principal: 0, interest: 0, insurance: 0 };
    const total = result.totalCost;
    const principal = Number.parseFloat(amount) || 0;
    return {
      principal: (principal / total) * 100,
      interest: (result.totalInterest / total) * 100,
      insurance: (result.insuranceCost / total) * 100,
    };
  }, [result, amount]);

  return (
    <div className="h-full grid lg:grid-cols-3 gap-6">
      {/* Left: Inputs */}
      <Card className="border-0 shadow-sm bg-white overflow-auto">
        <CardContent className="p-5 space-y-5">
          {/* Montant emprunté */}
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide">
              Montant emprunté
            </Label>
            <InputGroup className="mt-1.5 h-11">
              <InputGroupAddon>
                <Euro className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                value={amount}
                onChange={(e) => setParams({ amount: e.target.value })}
                className="text-lg font-medium"
                placeholder="250000"
              />
            </InputGroup>
            <Slider
              value={[
                Math.min(Math.max(Number(amount) || 50_000, 50_000), 1_000_000),
              ]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setParams({ amount: val.toString() });
              }}
              min={50_000}
              max={1_000_000}
              step={10_000}
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>50k</span>
              <span>1M</span>
            </div>
          </div>

          {/* Durée */}
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide">
              Durée : {duration} ans
            </Label>
            <InputGroup className="mt-1.5 h-11">
              <InputGroupAddon>
                <Calendar className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                value={duration}
                onChange={(e) => setParams({ duration: Number(e.target.value) || 0 })}
                className="text-lg font-medium"
                placeholder="20"
              />
            </InputGroup>
            <Slider
              value={[Math.min(Math.max(duration || 5, 5), 30)]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setParams({ duration: val });
              }}
              min={5}
              max={30}
              step={1}
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>5 ans</span>
              <span>30 ans</span>
            </div>
          </div>

          {/* Taux */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Taux intérêt
              </Label>
              <InputGroup className="mt-1.5 h-10">
                <InputGroupAddon>
                  <Percent className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setParams({ rate: e.target.value })}
                  className="text-base font-medium"
                  placeholder="3.5"
                />
              </InputGroup>
            </div>
            <div>
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Assurance
              </Label>
              <InputGroup className="mt-1.5 h-10">
                <InputGroupAddon>
                  <Percent className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  step="0.01"
                  value={insuranceRate}
                  onChange={(e) => setParams({ insuranceRate: e.target.value })}
                  className="text-base font-medium"
                  placeholder="0.34"
                />
              </InputGroup>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-neutral-100 pt-4">
            <IncomeSection income={income} onChange={setIncome} />
          </div>
        </CardContent>
      </Card>

      {/* Right: Results */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {result ? (
          <>
            {/* Main Result */}
            <div className="bg-neutral-900 rounded-2xl p-6 text-center">
              <div className="text-xs text-neutral-400 uppercase tracking-widest">
                Mensualité (assurance incluse)
              </div>
              <div className="text-4xl font-bold text-white mt-2 tabular-nums">
                {formatCurrencyDetailed(result.monthlyPayment)}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                pendant {duration} ans ({duration * 12} mois)
              </div>
            </div>

            {/* Debt Ratio Indicator */}
            {totalIncome > 0 && (
              <DebtRatioIndicator
                monthlyPayment={result.monthlyPayment}
                monthlyIncome={totalIncome}
                existingLoans={existingLoans}
              />
            )}

            {/* Distribution & Details */}
            <Card className="border-0 shadow-sm bg-white flex-1">
              <CardContent className="p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-neutral-700">
                      Répartition du coût total
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatCurrency(result.totalCost)}
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${distribution.principal}%` }}
                    />
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${distribution.interest}%` }}
                    />
                    <div
                      className="h-full bg-blue-400"
                      style={{ width: `${distribution.insurance}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-neutral-600">
                        Capital {distribution.principal.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-neutral-600">
                        Intérêts {distribution.interest.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <span className="text-neutral-600">
                        Assurance {distribution.insurance.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-4 border-t border-neutral-100">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                      <Home className="size-3" />
                      Capital
                    </div>
                    <div className="text-base font-semibold text-neutral-900 tabular-nums mt-1">
                      {formatCurrency(Number(amount))}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-xs text-amber-700 flex items-center justify-center gap-1">
                      <TrendingUp className="size-3" />
                      Intérêts
                    </div>
                    <div className="text-base font-semibold text-amber-900 tabular-nums mt-1">
                      {formatCurrency(result.totalInterest)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-700">Assurance</div>
                    <div className="text-base font-semibold text-blue-900 tabular-nums mt-1">
                      {formatCurrency(result.insuranceCost)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-neutral-900 rounded-lg">
                    <div className="text-xs text-neutral-400">Coût total</div>
                    <div className="text-base font-semibold text-white tabular-nums mt-1">
                      {formatCurrency(result.totalCost)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-dashed border-neutral-200 flex-1">
            <CardContent className="flex h-full items-center justify-center">
              <p className="text-neutral-400">Entrez un montant valide</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
