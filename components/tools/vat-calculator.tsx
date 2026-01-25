"use client";

import { useMemo } from "react";
import { useQueryStates, parseAsString, parseAsStringLiteral, parseAsFloat } from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Euro } from "lucide-react";

const modes = ["ht", "ttc"] as const;
type Mode = typeof modes[number];

const TVA_RATES = [20, 10, 5.5, 2.1];

export function VatCalculator() {
  const [params, setParams] = useQueryStates({
    amount: parseAsString.withDefault("1000"),
    mode: parseAsStringLiteral(modes).withDefault("ht"),
    rate: parseAsFloat.withDefault(20),
  }, { history: "replace" });

  const { amount, mode, rate } = params;

  const result = useMemo(() => {
    const value = Number.parseFloat(amount) || 0;
    const tvaRate = rate / 100;

    if (mode === "ht") {
      const tva = value * tvaRate;
      return {
        ht: value,
        tva,
        ttc: value + tva,
      };
    }

    const ht = value / (1 + tvaRate);
    return {
      ht,
      tva: value - ht,
      ttc: value,
    };
  }, [amount, mode, rate]);

  const format = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className="h-full grid lg:grid-cols-3 gap-6">
      {/* Left: Inputs */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5 space-y-4">
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide">
              Montant {mode.toUpperCase()}
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
                placeholder="0"
              />
            </InputGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Type
              </Label>
              <Select value={mode} onValueChange={(v) => setParams({ mode: v as Mode })}>
                <SelectTrigger className="mt-1.5 h-10 border-neutral-200">
                  <SelectValue>{mode.toUpperCase()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ht">HT</SelectItem>
                  <SelectItem value="ttc">TTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Taux TVA
              </Label>
              <Select
                value={rate.toString()}
                onValueChange={(v) => v && setParams({ rate: +v })}
              >
                <SelectTrigger className="mt-1.5 h-10 border-neutral-200">
                  <SelectValue>{rate}%</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TVA_RATES.map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      {r}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Results */}
      <div className="lg:col-span-2 grid grid-rows-2 gap-4">
        {/* Main Result */}
        <div className="bg-neutral-900 rounded-2xl p-6 flex flex-col justify-center text-center">
          <div className="text-xs text-neutral-400 uppercase tracking-widest">
            Montant TTC
          </div>
          <div className="text-4xl font-bold text-white mt-2 tabular-nums">
            {format(result.ttc)}
          </div>
          <div className="text-sm text-neutral-500 mt-1">
            dont {format(result.tva)} de TVA
          </div>
        </div>

        {/* Breakdown */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5 h-full">
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-xl">
                <div className="text-xs text-neutral-500 uppercase tracking-wide">
                  HT
                </div>
                <div className="text-2xl font-semibold text-neutral-900 mt-2 tabular-nums">
                  {format(result.ht)}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-neutral-100 rounded-xl">
                <div className="text-xs text-neutral-500 uppercase tracking-wide">
                  TVA ({rate}%)
                </div>
                <div className="text-2xl font-semibold text-neutral-900 mt-2 tabular-nums">
                  {format(result.tva)}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-neutral-900 rounded-xl">
                <div className="text-xs text-neutral-400 uppercase tracking-wide">
                  TTC
                </div>
                <div className="text-2xl font-semibold text-white mt-2 tabular-nums">
                  {format(result.ttc)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
