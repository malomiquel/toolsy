"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type EmployeeStatus = "non-cadre" | "cadre" | "fonction-publique" | "liberal" | "portage";
type Period = "hourly" | "monthly" | "annual";

interface SalaryResult {
  brutHourly: number;
  brutMonthly: number;
  brutAnnual: number;
  netHourly: number;
  netMonthly: number;
  netAnnual: number;
  netAfterTaxMonthly: number;
  netAfterTaxAnnual: number;
}

const CHARGES_RATES = {
  "non-cadre": 0.22, // 22% de charges
  "cadre": 0.25, // 25% de charges
  "fonction-publique": 0.215, // 21.5% de charges
  "liberal": 0.45, // 45% de charges
  "portage": 0.50, // 50% de charges
};

const HOURS_PER_MONTH = 151.67; // 35h semaine
const STATUS_LABELS = {
  "non-cadre": "Salarié non-cadre",
  "cadre": "Salarié cadre",
  "fonction-publique": "Fonction publique",
  "liberal": "Profession libérale",
  "portage": "Portage salarial",
};

export function SalaryCalculator() {
  const [brutAmount, setBrutAmount] = useState<string>("2500");
  const [period, setPeriod] = useState<Period>("monthly");
  const [status, setStatus] = useState<EmployeeStatus>("non-cadre");
  const [workTime, setWorkTime] = useState<number>(100);
  const [bonusMonths, setBonusMonths] = useState<number>(12);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [result, setResult] = useState<SalaryResult | null>(null);

  useEffect(() => {
    calculateSalary();
  }, [brutAmount, period, status, workTime, bonusMonths, taxRate]);

  function calculateSalary() {
    const brut = parseFloat(brutAmount) || 0;
    if (brut === 0) {
      setResult(null);
      return;
    }

    const chargesRate = CHARGES_RATES[status];
    const workTimeMultiplier = workTime / 100;

    let brutMonthly: number;
    if (period === "hourly") {
      brutMonthly = brut * HOURS_PER_MONTH * workTimeMultiplier;
    } else if (period === "monthly") {
      brutMonthly = brut;
    } else {
      brutMonthly = brut / bonusMonths;
    }

    const netMonthly = brutMonthly * (1 - chargesRate);
    const netAfterTaxMonthly = netMonthly * (1 - taxRate / 100);

    const brutHourly = brutMonthly / HOURS_PER_MONTH / workTimeMultiplier;
    const brutAnnual = brutMonthly * bonusMonths;
    const netHourly = netMonthly / HOURS_PER_MONTH / workTimeMultiplier;
    const netAnnual = netMonthly * bonusMonths;
    const netAfterTaxAnnual = netAfterTaxMonthly * bonusMonths;

    setResult({
      brutHourly,
      brutMonthly,
      brutAnnual,
      netHourly,
      netMonthly,
      netAnnual,
      netAfterTaxMonthly,
      netAfterTaxAnnual,
    });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations du salaire</CardTitle>
            <CardDescription>Renseignez votre salaire brut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brut-amount">Salaire brut</Label>
              <div className="relative">
                <Input
                  id="brut-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={brutAmount}
                  onChange={(e) => setBrutAmount(e.target.value)}
                  className="pr-12 text-lg font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Période</Label>
              <Select value={period} onValueChange={(value) => value && setPeriod(value as Period)}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="hourly">Horaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="annual">Annuel</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={status} onValueChange={(value) => value && setStatus(value as EmployeeStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres avancés</CardTitle>
            <CardDescription>Ajustez selon votre situation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="work-time">Temps de travail</Label>
                <Badge variant="secondary">{workTime}%</Badge>
              </div>
              <input
                id="work-time"
                type="range"
                min="0"
                max="100"
                step="5"
                value={workTime}
                onChange={(e) => setWorkTime(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-months">Nombre de mois de prime</Label>
              <Select value={bonusMonths.toString()} onValueChange={(value) => value && setBonusMonths(parseInt(value))}>
                <SelectTrigger id="bonus-months">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[12, 13, 14, 15, 16].map((months) => (
                      <SelectItem key={months} value={months.toString()}>
                        {months} mois
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tax-rate">Taux de prélèvement à la source</Label>
                <Badge variant="secondary">{taxRate.toFixed(1)}%</Badge>
              </div>
              <input
                id="tax-rate"
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {result && (
          <>
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Salaire net (avant impôts)</CardTitle>
                <CardDescription>Après déduction des charges sociales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Horaire</span>
                  <span className="text-2xl font-bold">{formatCurrency(result.netHourly)}</span>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Mensuel</span>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(result.netMonthly)}</span>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Annuel</span>
                  <span className="text-2xl font-bold">{formatCurrency(result.netAnnual)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">
                  Salaire net après impôts
                </CardTitle>
                <CardDescription>Après prélèvement à la source</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Mensuel net</span>
                  <span className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(result.netAfterTaxMonthly)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Annuel net</span>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(result.netAfterTaxAnnual)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salaire brut annuel</span>
                  <span className="font-semibold">{formatCurrency(result.brutAnnual)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Charges sociales ({(CHARGES_RATES[status] * 100).toFixed(1)}%)</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(result.brutAnnual - result.netAnnual)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salaire net avant impôts</span>
                  <span className="font-semibold">{formatCurrency(result.netAnnual)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prélèvement à la source ({taxRate.toFixed(1)}%)</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(result.netAnnual - result.netAfterTaxAnnual)}
                  </span>
                </div>
                <Separator className="bg-primary" />
                <div className="flex justify-between">
                  <span className="font-semibold">Salaire net après impôts</span>
                  <span className="text-lg font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(result.netAfterTaxAnnual)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!result && (
          <Card className="border-dashed">
            <CardContent className="flex min-h-[300px] items-center justify-center">
              <p className="text-muted-foreground">
                Renseignez votre salaire brut pour voir les résultats
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
