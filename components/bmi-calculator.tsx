"use client";

import { useMemo } from "react";
import { useQueryStates, parseAsInteger } from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
} from "lucide-react";

interface BMICategory {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  min: number;
  max: number;
  description: string;
  icon: typeof Scale;
}

const BMI_CATEGORIES: BMICategory[] = [
  {
    label: "Maigreur",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    min: 0,
    max: 18.5,
    description: "Un IMC inférieur à 18.5 peut indiquer une insuffisance pondérale. Consultez un professionnel de santé.",
    icon: TrendingDown,
  },
  {
    label: "Normal",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    min: 18.5,
    max: 25,
    description: "Votre poids est considéré comme normal. Continuez à maintenir une alimentation équilibrée et une activité physique régulière.",
    icon: Minus,
  },
  {
    label: "Surpoids",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
    min: 25,
    max: 30,
    description: "Un IMC entre 25 et 30 indique un surpoids. Une alimentation équilibrée et de l'exercice peuvent aider.",
    icon: TrendingUp,
  },
  {
    label: "Obésité modérée",
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    min: 30,
    max: 35,
    description: "Un IMC entre 30 et 35 indique une obésité modérée. Il est conseillé de consulter un professionnel de santé.",
    icon: AlertTriangle,
  },
  {
    label: "Obésité sévère",
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    min: 35,
    max: 40,
    description: "Un IMC entre 35 et 40 indique une obésité sévère. Une prise en charge médicale est recommandée.",
    icon: AlertTriangle,
  },
  {
    label: "Obésité morbide",
    color: "bg-red-700",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    min: 40,
    max: 100,
    description: "Un IMC supérieur à 40 indique une obésité morbide. Une prise en charge médicale urgente est nécessaire.",
    icon: AlertTriangle,
  },
];

function getCategory(bmi: number): BMICategory {
  return BMI_CATEGORIES.find((cat) => bmi >= cat.min && bmi < cat.max) || BMI_CATEGORIES[5];
}

function getIdealWeight(height: number): { min: number; max: number } {
  const heightM = height / 100;
  return {
    min: Math.round(18.5 * heightM * heightM),
    max: Math.round(25 * heightM * heightM),
  };
}

export function BmiCalculator() {
  const [params, setParams] = useQueryStates(
    {
      height: parseAsInteger.withDefault(170),
      weight: parseAsInteger.withDefault(70),
    },
    { history: "replace" }
  );

  const { height, weight } = params;

  const bmi = useMemo(() => {
    const heightM = height / 100;
    return weight / (heightM * heightM);
  }, [height, weight]);

  const category = getCategory(bmi);
  const idealWeight = getIdealWeight(height);
  const CategoryIcon = category.icon;

  const gaugePosition = useMemo(() => {
    // Map BMI 15-40 to 0-100%
    const normalized = ((bmi - 15) / (40 - 15)) * 100;
    return Math.max(0, Math.min(100, normalized));
  }, [bmi]);

  return (
    <div className="h-full grid lg:grid-cols-3 gap-6">
      {/* Left: Inputs */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5 space-y-6">
          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Taille
              </Label>
              <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                {height} cm
              </span>
            </div>
            <Slider
              value={[height]}
              onValueChange={(v) => setParams({ height: Array.isArray(v) ? v[0] : v })}
              min={100}
              max={220}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-1.5 text-xs text-neutral-400">
              <span>100 cm</span>
              <span>220 cm</span>
            </div>
          </div>

          {/* Weight */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Poids
              </Label>
              <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                {weight} kg
              </span>
            </div>
            <Slider
              value={[weight]}
              onValueChange={(v) => setParams({ weight: Array.isArray(v) ? v[0] : v })}
              min={30}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-1.5 text-xs text-neutral-400">
              <span>30 kg</span>
              <span>200 kg</span>
            </div>
          </div>

          {/* Ideal weight info */}
          <div className="p-4 bg-neutral-50 rounded-xl">
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              Poids idéal pour {height} cm
            </div>
            <div className="text-lg font-semibold text-neutral-900">
              {idealWeight.min} - {idealWeight.max} kg
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Results */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Main Result */}
        <div className="bg-neutral-900 rounded-2xl p-6 flex-1 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="text-xs text-neutral-400 uppercase tracking-widest mb-2">
              Votre IMC
            </div>
            <div className="text-6xl font-bold text-white tabular-nums">
              {bmi.toFixed(1)}
            </div>
            <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full ${category.bgColor}`}>
              <CategoryIcon className={`w-4 h-4 ${category.textColor}`} />
              <span className={`text-sm font-medium ${category.textColor}`}>
                {category.label}
              </span>
            </div>
          </div>

          {/* Gauge */}
          <div className="relative h-3 bg-neutral-800 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="h-full bg-blue-500" style={{ width: "14%" }} />
              <div className="h-full bg-green-500" style={{ width: "26%" }} />
              <div className="h-full bg-yellow-500" style={{ width: "20%" }} />
              <div className="h-full bg-orange-500" style={{ width: "20%" }} />
              <div className="h-full bg-red-500" style={{ width: "20%" }} />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-neutral-900 shadow-lg transition-all duration-300"
              style={{ left: `calc(${gaugePosition}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>35</span>
            <span>40</span>
          </div>
        </div>

        {/* Description */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className={`p-3 rounded-xl ${category.bgColor} shrink-0`}>
                <CategoryIcon className={`w-6 h-6 ${category.textColor}`} />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 mb-1">
                  {category.label}
                </h3>
                <p className="text-sm text-neutral-600">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">
                L&apos;IMC est un indicateur général. Il ne prend pas en compte la masse musculaire,
                l&apos;âge, le sexe ou la répartition des graisses. Consultez un professionnel de santé
                pour une évaluation complète.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
