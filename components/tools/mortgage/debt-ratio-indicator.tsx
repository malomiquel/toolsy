"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface DebtRatioIndicatorProps {
  monthlyPayment: number;
  monthlyIncome: number;
  existingLoans?: number;
}

export function DebtRatioIndicator({
  monthlyPayment,
  monthlyIncome,
  existingLoans = 0,
}: DebtRatioIndicatorProps) {
  if (monthlyIncome <= 0) return null;

  const totalDebt = monthlyPayment + existingLoans;
  const debtRatio = (totalDebt / monthlyIncome) * 100;
  const _maxRecommended = 35;

  const getStatus = () => {
    if (debtRatio <= 30) return "good";
    if (debtRatio <= 35) return "warning";
    return "danger";
  };

  const status = getStatus();

  const statusConfig = {
    good: {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      barColor: "bg-emerald-500",
      label: "Finançable",
      description: "Taux d'endettement optimal",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      barColor: "bg-amber-500",
      label: "Limite",
      description: "Proche du seuil maximum (35%)",
    },
    danger: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      barColor: "bg-red-500",
      label: "Non finançable",
      description: "Dépasse le seuil légal de 35%",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Reste à vivre
  const remainingIncome = monthlyIncome - totalDebt;

  return (
    <div className={`rounded-xl p-4 ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`size-5 shrink-0 mt-0.5 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm font-semibold ${config.color}`}>
              {config.label}
            </span>
            <span className={`text-lg font-bold tabular-nums ${config.color}`}>
              {debtRatio.toFixed(1)}%
            </span>
          </div>

          {/* Barre de progression */}
          <div className="mt-2 h-2 w-full rounded-full bg-white/60 overflow-hidden">
            <div
              className={`h-full ${config.barColor} transition-all`}
              style={{ width: `${Math.min(debtRatio, 100)}%` }}
            />
            {/* Marqueur 35% */}
            <div
              className="relative"
              style={{ marginTop: "-8px", marginLeft: "35%" }}
            >
              <div className="w-0.5 h-2 bg-neutral-400" />
            </div>
          </div>

          <p className="text-xs text-neutral-600 mt-2">{config.description}</p>

          {/* Détails */}
          <div className="mt-3 pt-3 border-t border-neutral-200/50 space-y-2">
            {existingLoans > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600">Crédits en cours</span>
                <span className="text-sm font-medium tabular-nums text-neutral-700">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(existingLoans)}
                  /mois
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600">Reste à vivre</span>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  remainingIncome < 0 ? "text-red-600" : "text-neutral-900"
                }`}
              >
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(remainingIncome)}
                /mois
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
