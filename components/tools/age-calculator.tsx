"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Cake,
  Clock,
  Heart,
  Wind,
  Moon,
  Coffee,
  Smile,
  Calendar as CalendarIcon,
  Sparkles,
  Droplet,
  Utensils,
  Monitor,
  Footprints,
  Leaf,
  Globe,
  Tv,
  LucideIcon,
} from "lucide-react";
import { fr } from "date-fns/locale";
import { format } from "date-fns";

interface AgeDetails {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

interface NextBirthday {
  daysUntil: number;
  nextAge: number;
  date: Date;
}

function calculateAge(birthDate: Date, now: Date): AgeDetails {
  const years = now.getFullYear() - birthDate.getFullYear();
  const months = now.getMonth() - birthDate.getMonth();
  const days = now.getDate() - birthDate.getDate();

  let adjustedYears = years;
  let adjustedMonths = months;
  let adjustedDays = days;

  if (adjustedDays < 0) {
    adjustedMonths--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    adjustedDays += prevMonth.getDate();
  }

  if (adjustedMonths < 0) {
    adjustedYears--;
    adjustedMonths += 12;
  }

  const totalMs = now.getTime() - birthDate.getTime();
  const totalSeconds = Math.floor(totalMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  return {
    years: adjustedYears,
    months: adjustedMonths,
    days: adjustedDays,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
}

function getNextBirthday(birthDate: Date, now: Date): NextBirthday {
  const thisYearBirthday = new Date(
    now.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
  );

  let nextBirthday = thisYearBirthday;
  if (thisYearBirthday <= now) {
    nextBirthday = new Date(
      now.getFullYear() + 1,
      birthDate.getMonth(),
      birthDate.getDate(),
    );
  }

  const daysUntil = Math.ceil(
    (nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const nextAge = nextBirthday.getFullYear() - birthDate.getFullYear();

  return { daysUntil, nextAge, date: nextBirthday };
}

function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR");
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-neutral-100">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-neutral-500 truncate">{label}</div>
        <div className="text-sm font-semibold text-neutral-900 tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

function LiveCounter({ seconds }: { seconds: number }) {
  const [currentSeconds, setCurrentSeconds] = useState(seconds);

  useEffect(() => {
    setCurrentSeconds(seconds);
    const interval = setInterval(() => {
      setCurrentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const hours = Math.floor(currentSeconds / 3600);
  const minutes = Math.floor((currentSeconds % 3600) / 60);
  const secs = currentSeconds % 60;

  return (
    <div className="flex items-center justify-center gap-2 text-4xl md:text-5xl font-bold text-white tabular-nums font-mono">
      <span className="bg-white/10 px-3 py-2 rounded-lg">
        {String(hours).padStart(2, "0")}
      </span>
      <span className="text-white/50 animate-pulse">:</span>
      <span className="bg-white/10 px-3 py-2 rounded-lg">
        {String(minutes).padStart(2, "0")}
      </span>
      <span className="text-white/50 animate-pulse">:</span>
      <span className="bg-white/10 px-3 py-2 rounded-lg">
        {String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}

export function AgeCalculator() {
  const [birthDateStr, setBirthDateStr] = useQueryState(
    "birth",
    parseAsString.withDefault(""),
  );
  const [now, setNow] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (calendarOpen) return;
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [calendarOpen]);

  const birthDate = useMemo(() => {
    if (!birthDateStr) return null;
    const date = new Date(birthDateStr);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [birthDateStr]);

  const age = useMemo(() => {
    if (!birthDate) return null;
    return calculateAge(birthDate, now);
  }, [birthDate, now]);

  const nextBirthday = useMemo(() => {
    if (!birthDate) return null;
    return getNextBirthday(birthDate, now);
  }, [birthDate, now]);

  const stats = useMemo(() => {
    if (!age) return [];

    return [
      // Corps / physiologie
      {
        key: "heartbeats",
        label: "Battements de cœur",
        icon: Heart,
        color: "bg-red-500",
        value: Math.floor(age.totalMinutes * 72),
      },
      {
        key: "breaths",
        label: "Respirations",
        icon: Wind,
        color: "bg-sky-500",
        value: Math.floor(age.totalMinutes * 15),
      },
      {
        key: "bloodLitersPumped",
        label: "Litres de sang pompés",
        icon: Droplet, // ← à remplacer par ton icône sang/goutte si tu en as une
        color: "bg-rose-600",
        value: Math.floor(age.totalMinutes * 72 * 0.07),
      },
      {
        key: "sleepHours",
        label: "Heures de sommeil",
        icon: Moon,
        color: "bg-indigo-500",
        value: Math.floor(age.totalDays * 8),
      },
      {
        key: "caloriesBurned",
        label: "Calories brûlées",
        icon: Sparkles,
        color: "bg-orange-500",
        value: Math.floor(age.totalDays * 1800),
      },

      // Vie quotidienne
      {
        key: "coffees",
        label: "Cafés consommés (si adulte)",
        icon: Coffee,
        color: "bg-amber-600",
        value: Math.floor(age.totalDays * 0.7),
      },
      {
        key: "meals",
        label: "Repas pris",
        icon: Utensils, // ← ou UtensilsCrossed, Pizza, etc.
        color: "bg-emerald-600",
        value: Math.floor(age.totalDays * 3),
      },
      {
        key: "screenHours",
        label: "Heures devant écran",
        icon: Monitor,
        color: "bg-blue-600",
        value: Math.floor(age.totalDays * 5),
      },
      {
        key: "walkingKm",
        label: "Kilomètres marchés",
        icon: Footprints, // ou Wind si tu préfères garder le même
        color: "bg-green-500",
        value: Math.floor(age.totalDays * 5),
      },
      {
        key: "steps",
        label: "Pas effectués",
        icon: Footprints,
        color: "bg-lime-600",
        value: Math.floor(age.totalDays * 6500),
      },

      // Temps & cycles
      {
        key: "smiles",
        label: "Sourires esquissés",
        icon: Smile,
        color: "bg-yellow-500",
        value: Math.floor(age.totalDays * 20),
      },
      {
        key: "fullMoons",
        label: "Pleines lunes vues",
        icon: Moon,
        color: "bg-slate-600",
        value: Math.floor(age.totalDays / 29.5),
      },
      {
        key: "seasons",
        label: "Saisons traversées",
        icon: Leaf,
        color: "bg-teal-600",
        value: Math.floor(age.totalDays / 91.25), // ≈ 365/4
      },
      {
        key: "leapYears",
        label: "Années bissextiles",
        icon: CalendarIcon,
        color: "bg-purple-600",
        value: Math.floor(age.years / 4),
      },

      // Fun / abstrait
      {
        key: "earthCircumferenceWalks",
        label: "Tours de la Terre (à pied)",
        icon: Globe,
        color: "bg-cyan-600",
        value: Number(((age.totalDays * 5) / 40_075).toFixed(2)),
      },
      {
        key: "netflixEpisodes",
        label: "Épisodes Netflix (~1h)",
        icon: Tv,
        color: "bg-red-700",
        value: Math.floor(age.totalHours),
      },
    ];
  }, [age]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setBirthDateStr(format(date, "yyyy-MM-dd"));
      setCalendarOpen(false);
    }
  };

  // Calculate seconds lived today
  const secondsLivedToday = useMemo(() => {
    if (!birthDate) return 0;
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return Math.floor((now.getTime() - startOfDay.getTime()) / 1000);
  }, [birthDate, now]);

  return (
    <div className="h-full grid lg:grid-cols-3 gap-6">
      {/* Left: Input */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5 space-y-6">
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide mb-3 block">
              Date de naissance
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    id="date"
                    className="justify-start font-normal"
                  >
                    {birthDate
                      ? format(birthDate, "dd MMMM yyyy", { locale: fr })
                      : "Select date"}
                  </Button>
                }
              />
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  locale={fr}
                  mode="single"
                  selected={birthDate ?? undefined}
                  defaultMonth={birthDate ?? undefined}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    handleDateSelect(date);
                    setCalendarOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {age && (
            <>
              {/* Age display */}
              <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">
                  Votre âge précis
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl font-bold text-blue-600">
                    {age.years}
                  </span>
                  <span className="text-neutral-500">ans</span>
                  <span className="text-2xl font-semibold text-blue-500">
                    {age.months}
                  </span>
                  <span className="text-neutral-500">mois</span>
                  <span className="text-xl font-medium text-blue-400">
                    {age.days}
                  </span>
                  <span className="text-neutral-500">jours</span>
                </div>
              </div>

              {/* Next birthday */}
              {nextBirthday && (
                <div className="p-4 bg-linear-to-br from-pink-50 to-rose-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Cake className="w-4 h-4 text-pink-500" />
                    <span className="text-xs text-neutral-500 uppercase tracking-wide">
                      Prochain anniversaire
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-pink-600">
                      {nextBirthday.daysUntil}
                    </span>
                    <span className="text-neutral-500">jours</span>
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">
                    Vous aurez{" "}
                    <span className="font-medium text-pink-600">
                      {nextBirthday.nextAge} ans
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {!birthDate && (
            <div className="p-4 bg-neutral-50 rounded-xl text-center">
              <CalendarIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">
                Sélectionnez votre date de naissance pour voir les statistiques
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Results */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Live counter */}
        <div className="bg-linear-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 flex-1 flex flex-col justify-center items-center min-h-50">
          {age ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-white/70" />
                <span className="text-white/70 text-sm uppercase tracking-wide">
                  Temps vécu aujourd&apos;hui
                </span>
              </div>
              <LiveCounter seconds={secondsLivedToday} />
              <div className="mt-6 text-center">
                <div className="text-white/50 text-xs uppercase tracking-wide mb-1">
                  Total depuis votre naissance
                </div>
                <div className="text-white text-xl font-semibold tabular-nums">
                  {formatNumber(age.totalDays)} jours ·{" "}
                  {formatNumber(age.totalHours)} heures
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/50">Entrez votre date de naissance</p>
            </div>
          )}
        </div>

        {/* Fun stats */}
        {stats && stats.length > 0 && (
          <Card className="border-0 shadow-sm bg-neutral-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-neutral-700">
                  Statistiques fun (estimations)
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stats.map(({ key, label, icon: Icon, color, value }) => (
                  <StatCard
                    key={key}
                    icon={Icon}
                    label={label}
                    value={formatNumber(value)}
                    color={color}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
