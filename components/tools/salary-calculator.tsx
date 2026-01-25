"use client";

import { useMemo } from "react";
import { useQueryStates, parseAsString, parseAsStringLiteral, parseAsInteger } from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Euro } from "lucide-react";

type EmployeeStatus =
  | "non-cadre"
  | "cadre"
  | "fonction-publique"
  | "liberal"
  | "portage";
type Period = "hourly" | "monthly" | "annual";

interface SalaryResult {
  brutMonthly: number;
  brutAnnual: number;
  netMonthly: number;
  netAnnual: number;
  netAfterTaxMonthly: number;
  netAfterTaxAnnual: number;
  chargesAmount: number;
  taxAmount: number;
}

const CHARGES_RATES: Record<EmployeeStatus, number> = {
  "non-cadre": 0.22,
  cadre: 0.25,
  "fonction-publique": 0.215,
  liberal: 0.45,
  portage: 0.5,
};

const HOURS_PER_MONTH = 151.67;

const STATUS_OPTIONS: { value: EmployeeStatus; label: string }[] = [
  { value: "non-cadre", label: "Non-cadre" },
  { value: "cadre", label: "Cadre" },
  { value: "fonction-publique", label: "Fonction publique" },
  { value: "liberal", label: "Libéral" },
  { value: "portage", label: "Portage" },
];

const employeeStatuses = ["non-cadre", "cadre", "fonction-publique", "liberal", "portage"] as const;
const periods = ["hourly", "monthly", "annual"] as const;

export function SalaryCalculator() {
  const [params, setParams] = useQueryStates({
    brut: parseAsString.withDefault("3000"),
    period: parseAsStringLiteral(periods).withDefault("monthly"),
    status: parseAsStringLiteral(employeeStatuses).withDefault("non-cadre"),
    time: parseAsInteger.withDefault(100),
  }, { history: "replace" });

  const { brut: brutAmount, period, status, time: workTime } = params;
  const bonusMonths = 12;
  const taxRate = 0;

  const result = useMemo<SalaryResult | null>(() => {
    const brut = Number.parseFloat(brutAmount) || 0;
    if (brut === 0) return null;

    const chargesRate = CHARGES_RATES[status];
    const workTimeMultiplier = workTime / 100;

    let brutMonthly: number;
    if (period === "hourly") {
      brutMonthly = brut * HOURS_PER_MONTH * workTimeMultiplier;
    } else if (period === "monthly") {
      brutMonthly = brut * workTimeMultiplier;
    } else {
      brutMonthly = (brut / bonusMonths) * workTimeMultiplier;
    }

    const netMonthly = brutMonthly * (1 - chargesRate);
    const netAfterTaxMonthly = netMonthly * (1 - taxRate / 100);
    const brutAnnual = brutMonthly * bonusMonths;
    const netAnnual = netMonthly * bonusMonths;
    const netAfterTaxAnnual = netAfterTaxMonthly * bonusMonths;

    return {
      brutMonthly,
      brutAnnual,
      netMonthly,
      netAnnual,
      netAfterTaxMonthly,
      netAfterTaxAnnual,
      chargesAmount: brutAnnual - netAnnual,
      taxAmount: netAnnual - netAfterTaxAnnual,
    };
  }, [brutAmount, period, status, workTime, bonusMonths, taxRate]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const distribution = useMemo(() => {
    if (!result) return { net: 0, tax: 0, charges: 0 };
    const total = result.brutAnnual;
    return {
      net: (result.netAfterTaxAnnual / total) * 100,
      tax: (result.taxAmount / total) * 100,
      charges: (result.chargesAmount / total) * 100,
    };
  }, [result]);

  return (
    <div className="h-full grid lg:grid-cols-3 gap-6">
      {/* Left: Inputs */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5 space-y-4">
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide">
              Salaire brut
            </Label>
            <InputGroup className="mt-1.5 h-11">
              <InputGroupAddon>
                <Euro className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                value={brutAmount}
                onChange={(e) => setParams({ brut: e.target.value })}
                className="text-lg font-medium"
                placeholder="0"
              />
            </InputGroup>
          </div>

          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide">
              Période
            </Label>
            <Tabs
              value={period}
              onValueChange={(v) => setParams({ period: v as Period })}
              className="mt-1.5"
            >
              <TabsList className="grid grid-cols-3 bg-neutral-100 p-1">
                <TabsTrigger
                  value="hourly"
                  className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Horaire
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Mensuel
                </TabsTrigger>
                <TabsTrigger
                  value="annual"
                  className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Annuel
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Statut
              </Label>
              <Select
                value={status}
                onValueChange={(v) => setParams({ status: v as EmployeeStatus })}
              >
                <SelectTrigger className="mt-1.5 h-10 border-neutral-200">
                  <SelectValue>
                    {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Temps
              </Label>
              <Select
                value={workTime.toString()}
                onValueChange={(v) => v && setParams({ time: +v })}
              >
                <SelectTrigger className="mt-1.5 h-10 border-neutral-200">
                  <SelectValue>{workTime}%</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[50, 60, 70, 80, 90, 100].map((v) => (
                    <SelectItem key={v} value={v.toString()}>
                      {v}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Results */}
      <div className="lg:col-span-2 grid grid-rows-[auto_1fr] gap-4">
        {result ? (
          <>
            {/* Main Result */}
            <div className="bg-neutral-900 rounded-2xl p-6 text-center">
              <div className="text-xs text-neutral-400 uppercase tracking-widest">
                Net après impôt / mois
              </div>
              <div className="text-4xl font-bold text-white mt-2 tabular-nums">
                {formatCurrency(result.netAfterTaxMonthly)}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                {formatCurrency(result.netAfterTaxAnnual)} / an
              </div>
            </div>

            {/* Distribution */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-neutral-700">
                      Répartition
                    </span>
                    <span className="text-xs text-neutral-500">
                      {Math.round(distribution.net)}% net
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-neutral-900 transition-all"
                      style={{ width: `${distribution.net}%` }}
                    />
                    <div
                      className="h-full bg-neutral-400"
                      style={{ width: `${distribution.tax}%` }}
                    />
                    <div
                      className="h-full bg-neutral-200"
                      style={{ width: `${distribution.charges}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neutral-900" />
                      <span className="text-neutral-600">
                        Net {distribution.net.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neutral-400" />
                      <span className="text-neutral-600">
                        Impôts {distribution.tax.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neutral-200" />
                      <span className="text-neutral-600">
                        Charges {distribution.charges.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-100">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-xs text-neutral-500">
                      Coût employeur
                    </div>
                    <div className="text-lg font-semibold text-neutral-900 tabular-nums">
                      {formatCurrency(result.brutMonthly * 1.42)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <div className="text-xs text-neutral-500">Brut annuel</div>
                    <div className="text-lg font-semibold text-neutral-900 tabular-nums">
                      {formatCurrency(result.brutAnnual)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-dashed border-neutral-200 lg:col-span-2">
            <CardContent className="flex h-full items-center justify-center">
              <p className="text-neutral-400">Entrez un montant</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
