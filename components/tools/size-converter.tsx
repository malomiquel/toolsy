"use client";

import { useMemo } from "react";
import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = ["clothes-women", "clothes-men", "shoes-women", "shoes-men"] as const;
type Category = (typeof categories)[number];

const regions = ["eu", "uk", "us"] as const;
type Region = (typeof regions)[number];

const CATEGORY_LABELS: Record<Category, string> = {
  "clothes-women": "Vêtements Femme",
  "clothes-men": "Vêtements Homme",
  "shoes-women": "Chaussures Femme",
  "shoes-men": "Chaussures Homme",
};

const REGION_LABELS: Record<Region, string> = {
  eu: "EU/FR",
  uk: "UK",
  us: "US",
};

// Size conversion tables
const SIZE_TABLES: Record<Category, { eu: string; uk: string; us: string }[]> = {
  "clothes-women": [
    { eu: "32 (XXS)", uk: "4", us: "0" },
    { eu: "34 (XS)", uk: "6", us: "2" },
    { eu: "36 (S)", uk: "8", us: "4" },
    { eu: "38 (M)", uk: "10", us: "6" },
    { eu: "40 (M)", uk: "12", us: "8" },
    { eu: "42 (L)", uk: "14", us: "10" },
    { eu: "44 (L)", uk: "16", us: "12" },
    { eu: "46 (XL)", uk: "18", us: "14" },
    { eu: "48 (XXL)", uk: "20", us: "16" },
    { eu: "50 (3XL)", uk: "22", us: "18" },
  ],
  "clothes-men": [
    { eu: "44 (XS)", uk: "34", us: "34" },
    { eu: "46 (S)", uk: "36", us: "36" },
    { eu: "48 (M)", uk: "38", us: "38" },
    { eu: "50 (M)", uk: "40", us: "40" },
    { eu: "52 (L)", uk: "42", us: "42" },
    { eu: "54 (L)", uk: "44", us: "44" },
    { eu: "56 (XL)", uk: "46", us: "46" },
    { eu: "58 (XXL)", uk: "48", us: "48" },
    { eu: "60 (3XL)", uk: "50", us: "50" },
  ],
  "shoes-women": [
    { eu: "35", uk: "2", us: "4" },
    { eu: "35.5", uk: "2.5", us: "4.5" },
    { eu: "36", uk: "3", us: "5" },
    { eu: "36.5", uk: "3.5", us: "5.5" },
    { eu: "37", uk: "4", us: "6" },
    { eu: "37.5", uk: "4.5", us: "6.5" },
    { eu: "38", uk: "5", us: "7" },
    { eu: "38.5", uk: "5.5", us: "7.5" },
    { eu: "39", uk: "6", us: "8" },
    { eu: "39.5", uk: "6.5", us: "8.5" },
    { eu: "40", uk: "7", us: "9" },
    { eu: "41", uk: "7.5", us: "9.5" },
    { eu: "42", uk: "8", us: "10" },
  ],
  "shoes-men": [
    { eu: "39", uk: "5", us: "6" },
    { eu: "39.5", uk: "5.5", us: "6.5" },
    { eu: "40", uk: "6", us: "7" },
    { eu: "40.5", uk: "6.5", us: "7.5" },
    { eu: "41", uk: "7", us: "8" },
    { eu: "42", uk: "8", us: "9" },
    { eu: "42.5", uk: "8.5", us: "9.5" },
    { eu: "43", uk: "9", us: "10" },
    { eu: "44", uk: "9.5", us: "10.5" },
    { eu: "44.5", uk: "10", us: "11" },
    { eu: "45", uk: "10.5", us: "11.5" },
    { eu: "46", uk: "11", us: "12" },
    { eu: "47", uk: "12", us: "13" },
  ],
};

export function SizeConverter() {
  const [params, setParams] = useQueryStates(
    {
      category: parseAsStringLiteral(categories).withDefault("clothes-women"),
      region: parseAsStringLiteral(regions).withDefault("eu"),
      size: parseAsString.withDefault(""),
    },
    { history: "replace" }
  );

  const { category, region, size } = params;

  const table = SIZE_TABLES[category];

  const availableSizes = useMemo(() => {
    return table.map((row) => row[region]);
  }, [table, region]);

  const selectedSize = size || availableSizes[Math.floor(availableSizes.length / 2)];

  const selectedRowIndex = useMemo(() => {
    return table.findIndex((r) => r[region] === selectedSize);
  }, [table, region, selectedSize]);

  const result = selectedRowIndex >= 0 ? table[selectedRowIndex] : null;

  return (
    <div className="h-full grid lg:grid-cols-3 gap-6">
      {/* Left: Inputs + Results */}
      <div className="flex flex-col gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Catégorie
              </Label>
              <Select
                value={category}
                onValueChange={(v) =>
                  setParams({ category: v as Category, size: "" })
                }
              >
                <SelectTrigger className="mt-1.5 h-10 border-neutral-200 w-full">
                  <SelectValue>{CATEGORY_LABELS[category]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                  Région
                </Label>
                <Select
                  value={region}
                  onValueChange={(v) => setParams({ region: v as Region, size: "" })}
                >
                  <SelectTrigger className="mt-1.5 h-10 border-neutral-200">
                    <SelectValue>{REGION_LABELS[region]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {REGION_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                  Taille
                </Label>
                <Select
                  value={selectedSize}
                  onValueChange={(v) => setParams({ size: v })}
                >
                  <SelectTrigger className="mt-1.5 h-10 border-neutral-200">
                    <SelectValue>{selectedSize}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex-1 bg-neutral-900 rounded-2xl p-6 flex flex-col justify-center">
          <div className="text-xs text-neutral-400 uppercase tracking-widest text-center mb-4">
            {CATEGORY_LABELS[category]}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {regions.map((r) => (
              <div
                key={r}
                className={`flex flex-col items-center justify-center p-4 rounded-xl ${
                  r === region ? "bg-white" : "bg-neutral-800"
                }`}
              >
                <div
                  className={`text-xs uppercase tracking-wide ${
                    r === region ? "text-neutral-500" : "text-neutral-500"
                  }`}
                >
                  {REGION_LABELS[r]}
                </div>
                <div
                  className={`text-2xl font-bold mt-1 ${
                    r === region ? "text-neutral-900" : "text-white"
                  }`}
                >
                  {result ? result[r] : "-"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Full Table */}
      <Card className="lg:col-span-2 border-0 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="p-4 border-b border-neutral-100">
            <h3 className="text-sm font-medium text-neutral-900">
              Tableau des correspondances
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {CATEGORY_LABELS[category]}
            </p>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide text-left">
                    EU/FR
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide text-center">
                    UK
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wide text-center">
                    US
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {table.map((row, i) => (
                  <tr
                    key={i}
                    className={`cursor-pointer transition-colors ${
                      i === selectedRowIndex
                        ? "bg-neutral-900 text-white"
                        : "hover:bg-neutral-50"
                    }`}
                    onClick={() => setParams({ size: row[region] })}
                  >
                    <td
                      className={`px-4 py-3 text-sm font-medium ${
                        i === selectedRowIndex ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {row.eu}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-center ${
                        i === selectedRowIndex ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      {row.uk}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-center ${
                        i === selectedRowIndex ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      {row.us}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
