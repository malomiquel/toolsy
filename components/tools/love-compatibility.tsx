"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Heart, Sparkles, CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale/fr";

// --- Types ---

interface Person {
  name: string;
  birthdate: Date | undefined;
  [key: string]: string | Date | undefined | null;
}

const selectKeys = [
  "personality",
  "schedule",
  "food",
  "weekend",
  "music",
  "animal",
  "love",
  "tidiness",
  "money",
  "communication",
  "travel",
] as const;

type SelectKey = (typeof selectKeys)[number];

const emptyPerson: Person = {
  name: "",
  birthdate: undefined,
  ...Object.fromEntries(selectKeys.map((k) => [k, ""])),
};

// --- Zodiac ---

function getZodiacSign(date: Date | undefined): string | null {
  if (!date) return null;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "Bélier";
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "Taureau";
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return "Gémeaux";
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return "Cancer";
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "Lion";
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "Vierge";
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "Balance";
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "Scorpion";
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "Sagittaire";
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "Capricorne";
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "Verseau";
  return "Poissons";
}

const zodiacCompat: Record<string, Record<string, number>> = {
  Bélier: {
    Bélier: 10,
    Taureau: 2,
    Gémeaux: 12,
    Cancer: 0,
    Lion: 15,
    Vierge: 2,
    Balance: 8,
    Scorpion: 3,
    Sagittaire: 15,
    Capricorne: 0,
    Verseau: 7,
    Poissons: 3,
  },
  Taureau: {
    Taureau: 10,
    Gémeaux: 2,
    Cancer: 12,
    Lion: 3,
    Vierge: 15,
    Balance: 2,
    Scorpion: 8,
    Sagittaire: 0,
    Capricorne: 15,
    Verseau: 0,
    Poissons: 7,
  },
  Gémeaux: {
    Gémeaux: 10,
    Cancer: 2,
    Lion: 7,
    Vierge: 3,
    Balance: 15,
    Scorpion: 0,
    Sagittaire: 8,
    Capricorne: 0,
    Verseau: 15,
    Poissons: 2,
  },
  Cancer: {
    Cancer: 10,
    Lion: 3,
    Vierge: 7,
    Balance: 0,
    Scorpion: 15,
    Sagittaire: 0,
    Capricorne: 8,
    Verseau: 2,
    Poissons: 15,
  },
  Lion: {
    Lion: 10,
    Vierge: 2,
    Balance: 12,
    Scorpion: 3,
    Sagittaire: 15,
    Capricorne: 0,
    Verseau: 7,
    Poissons: 2,
  },
  Vierge: {
    Vierge: 10,
    Balance: 2,
    Scorpion: 12,
    Sagittaire: 2,
    Capricorne: 15,
    Verseau: 0,
    Poissons: 7,
  },
  Balance: {
    Balance: 10,
    Scorpion: 3,
    Sagittaire: 7,
    Capricorne: 2,
    Verseau: 15,
    Poissons: 2,
  },
  Scorpion: {
    Scorpion: 10,
    Sagittaire: 2,
    Capricorne: 7,
    Verseau: 0,
    Poissons: 15,
  },
  Sagittaire: { Sagittaire: 10, Capricorne: 2, Verseau: 12, Poissons: 3 },
  Capricorne: { Capricorne: 10, Verseau: 2, Poissons: 12 },
  Verseau: { Verseau: 10, Poissons: 3 },
  Poissons: { Poissons: 10 },
};

function getZodiacScore(z1: string, z2: string): number {
  return zodiacCompat[z1]?.[z2] ?? zodiacCompat[z2]?.[z1] ?? 0;
}

// --- Matrices de compatibilité croisée (avec négatifs) ---

type Matrix = Record<string, Record<string, number>>;

function getScore(m: Matrix, a: string, b: string): number {
  return m[a]?.[b] ?? m[b]?.[a] ?? 0;
}

const matrices: Record<SelectKey, Matrix> = {
  personality: {
    introverti: { introverti: 10, ambivert: 7, extraverti: -1 },
    ambivert: { ambivert: 9, extraverti: 6 },
    extraverti: { extraverti: 10 },
  },
  schedule: {
    morning: { morning: 12, flexible: 7, night: -4 },
    flexible: { flexible: 10, night: 6 },
    night: { night: 12 },
  },
  food: {
    pizza: { pizza: 8, burger: 6, sushi: 3, tacos: 5 },
    burger: { burger: 8, sushi: 2, tacos: 6 },
    sushi: { sushi: 8, tacos: 4 },
    tacos: { tacos: 8 },
  },
  weekend: {
    netflix: { netflix: 10, sortie: 2, sport: -2, voyage: 4 },
    sortie: { sortie: 10, sport: 6, voyage: 8 },
    sport: { sport: 10, voyage: 7 },
    voyage: { voyage: 10 },
  },
  music: {
    pop: { pop: 8, rap: 5, rock: 3, electro: 6, classique: 2 },
    rap: { rap: 8, rock: 3, electro: 6, classique: -2 },
    rock: { rock: 8, electro: 3, classique: 5 },
    electro: { electro: 8, classique: -1 },
    classique: { classique: 8 },
  },
  animal: {
    chien: { chien: 10, chat: 2, both: 8, none: -3 },
    chat: { chat: 10, both: 8, none: -3 },
    both: { both: 10, none: -5 },
    none: { none: 10 },
  },
  love: {
    paroles: { paroles: 12, cadeaux: 4, qualite: 8, toucher: 7, services: 5 },
    cadeaux: { cadeaux: 12, qualite: 4, toucher: 3, services: 7 },
    qualite: { qualite: 12, toucher: 9, services: 7 },
    toucher: { toucher: 12, services: 5 },
    services: { services: 12 },
  },
  tidiness: {
    bordélique: { bordélique: 7, normal: 2, maniaque: -6 },
    normal: { normal: 8, maniaque: 4 },
    maniaque: { maniaque: 10 },
  },
  money: {
    dépensier: { dépensier: 6, équilibré: 2, économe: -5 },
    équilibré: { équilibré: 9, économe: 6 },
    économe: { économe: 10 },
  },
  communication: {
    calme: { calme: 9, direct: 5, émotionnel: -3 },
    direct: { direct: 8, émotionnel: 2 },
    émotionnel: { émotionnel: 7 },
  },
  travel: {
    plage: { plage: 8, montagne: 3, ville: 2, aventure: 4 },
    montagne: { montagne: 8, ville: 0, aventure: 7 },
    ville: { ville: 8, aventure: 4 },
    aventure: { aventure: 8 },
  },
};

// --- Questions config ---

const questions: {
  key: SelectKey;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "personality",
    label: "Personnalité",
    options: [
      { value: "introverti", label: "Introverti(e)" },
      { value: "ambivert", label: "Ambivert(e)" },
      { value: "extraverti", label: "Extraverti(e)" },
    ],
  },
  {
    key: "schedule",
    label: "Rythme de vie",
    options: [
      { value: "morning", label: "Lève-tôt" },
      { value: "flexible", label: "Flexible" },
      { value: "night", label: "Couche-tard" },
    ],
  },
  {
    key: "tidiness",
    label: "Rangement",
    options: [
      { value: "bordélique", label: "Bordélique" },
      { value: "normal", label: "Entre les deux" },
      { value: "maniaque", label: "Maniaque" },
    ],
  },
  {
    key: "money",
    label: "Rapport à l'argent",
    options: [
      { value: "dépensier", label: "Dépensier" },
      { value: "équilibré", label: "Équilibré" },
      { value: "économe", label: "Économe" },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    options: [
      { value: "calme", label: "Calme / posé" },
      { value: "direct", label: "Direct / franc" },
      { value: "émotionnel", label: "Émotionnel" },
    ],
  },
  {
    key: "food",
    label: "Bouffe préférée",
    options: [
      { value: "pizza", label: "Pizza" },
      { value: "burger", label: "Burger" },
      { value: "sushi", label: "Sushi" },
      { value: "tacos", label: "Tacos" },
    ],
  },
  {
    key: "weekend",
    label: "Week-end idéal",
    options: [
      { value: "netflix", label: "Netflix & chill" },
      { value: "sortie", label: "Sortie entre amis" },
      { value: "sport", label: "Sport / nature" },
      { value: "voyage", label: "Voyage / road trip" },
    ],
  },
  {
    key: "music",
    label: "Musique",
    options: [
      { value: "pop", label: "Pop" },
      { value: "rap", label: "Rap / Hip-hop" },
      { value: "rock", label: "Rock" },
      { value: "electro", label: "Électro" },
      { value: "classique", label: "Classique / Jazz" },
    ],
  },
  {
    key: "travel",
    label: "Voyage idéal",
    options: [
      { value: "plage", label: "Plage / farniente" },
      { value: "montagne", label: "Montagne / nature" },
      { value: "ville", label: "City trip" },
      { value: "aventure", label: "Aventure / backpack" },
    ],
  },
  {
    key: "animal",
    label: "Animal préféré",
    options: [
      { value: "chien", label: "Chien" },
      { value: "chat", label: "Chat" },
      { value: "both", label: "Les deux" },
      { value: "none", label: "Aucun" },
    ],
  },
  {
    key: "love",
    label: "Langage amoureux",
    options: [
      { value: "paroles", label: "Mots doux" },
      { value: "cadeaux", label: "Cadeaux" },
      { value: "qualite", label: "Temps de qualité" },
      { value: "toucher", label: "Tendresse" },
      { value: "services", label: "Petites attentions" },
    ],
  },
];

// --- Lookup label from value ---

const labelMap = new Map<string, string>();
for (const q of questions) {
  for (const o of q.options) {
    labelMap.set(`${q.key}:${o.value}`, o.label);
  }
}

function getLabel(key: SelectKey, value: string): string {
  return labelMap.get(`${key}:${value}`) ?? value;
}

// --- Date Picker ---

function DatePickerButton({
  value,
  onChange,
  zodiac,
  color,
}: {
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  zodiac: string | null;
  color: "pink" | "purple";
}) {
  const [open, setOpen] = useState(false);
  const colorClass = color === "pink" ? "text-pink-500" : "text-purple-500";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="border-input data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 gap-1.5 rounded-lg border bg-transparent px-2.5 text-sm transition-colors select-none focus-visible:ring-[3px] h-8 flex w-full items-center justify-between whitespace-nowrap outline-none"
          />
        }
      >
        <span
          className={`truncate ${value ? "text-foreground" : "text-muted-foreground"}`}
        >
          {value
            ? `${value.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}${zodiac ? ` · ${zodiac}` : ""}`
            : "Date de naissance"}
        </span>
        <CalendarIcon
          className={`size-3.5 shrink-0 ${zodiac ? colorClass : "text-muted-foreground"}`}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          locale={fr}
          mode="single"
          captionLayout="dropdown"
          selected={value}
          defaultMonth={value ?? new Date(2000, 0)}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          startMonth={new Date(1940, 0)}
          endMonth={new Date()}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}

// --- Animated counter ---

function AnimatedScore({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setDisplay(start);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  return <>{display}</>;
}

// --- Main Component ---

export function LoveCompatibility() {
  const [person1, setPerson1] = useState<Person>({ ...emptyPerson });
  const [person2, setPerson2] = useState<Person>({ ...emptyPerson });
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const fireConfetti = useCallback(() => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#ec4899", "#f43f5e", "#a855f7", "#f97316", "#facc15"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#ec4899", "#f43f5e", "#a855f7", "#f97316", "#facc15"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const update1 = (key: string, value: string | Date | undefined | null) =>
    setPerson1((p) => ({ ...p, [key]: value }));
  const update2 = (key: string, value: string | Date | undefined | null) =>
    setPerson2((p) => ({ ...p, [key]: value }));

  const zodiac1 = getZodiacSign(person1.birthdate as Date | undefined);
  const zodiac2 = getZodiacSign(person2.birthdate as Date | undefined);

  const calculateCompatibility = () => {
    let score = 10;

    // Prénoms (max +10)
    const n1 = (person1.name as string).toLowerCase();
    const n2 = (person2.name as string).toLowerCase();
    const common = new Set([...n1].filter((l) => l.trim() && n2.includes(l)));
    score += Math.min(common.size * 2, 10);

    // Zodiac (max +15)
    if (zodiac1 && zodiac2) score += getZodiacScore(zodiac1, zodiac2);

    // Toutes les questions via matrices
    for (const key of selectKeys) {
      const v1 = person1[key] as string;
      const v2 = person2[key] as string;
      if (v1 && v2) score += getScore(matrices[key], v1, v2);
    }

    const finalScore = Math.max(0, Math.min(100, score));
    setShowResult(false);
    setResult(finalScore);
    // Trigger animation after state update
    requestAnimationFrame(() => setShowResult(true));
    // Confetti when score >= 95
    if (finalScore >= 95) {
      setTimeout(fireConfetti, 1200);
    }
  };

  const getResultMessage = (s: number) => {
    if (s >= 90) return "Match parfait ! Vous êtes faits l'un pour l'autre !";
    if (s >= 75) return "Excellente compatibilité ! L'amour est dans l'air !";
    if (s >= 60) return "Belle compatibilité ! Ça peut vraiment marcher !";
    if (s >= 45)
      return "Compatibilité moyenne, mais l'amour fait des miracles !";
    if (s >= 30) return "Quelques défis, mais rien n'est impossible !";
    if (s >= 15) return "Aïe... il va falloir faire des compromis !";
    return "Pas le meilleur match... Mais l'amour est imprévisible !";
  };

  const getResultEmoji = (s: number) => {
    if (s >= 90) return "💕";
    if (s >= 75) return "❤️";
    if (s >= 60) return "💖";
    if (s >= 45) return "💛";
    if (s >= 30) return "🧡";
    if (s >= 15) return "💙";
    return "💔";
  };

  const isFormValid =
    person1.name &&
    person2.name &&
    person1.birthdate &&
    person2.birthdate &&
    selectKeys.every((k) => person1[k]);
  const isForm2Valid = selectKeys.every((k) => person2[k]);
  const allValid = isFormValid && isForm2Valid;

  return (
    <div className="h-full grid lg:grid-cols-5 gap-6">
      {/* Formulaire */}
      <Card className="lg:col-span-2 border-0 shadow-sm bg-white overflow-auto">
        <CardContent className="p-5 space-y-2.5">
          {/* En-têtes */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-center gap-1.5 pb-0.5">
              <Heart className="size-3.5 text-pink-500 fill-pink-500" />
              <Label className="text-xs font-medium text-pink-600 uppercase tracking-wide">
                Personne 1
              </Label>
            </div>
            <div className="flex items-center justify-center gap-1.5 pb-0.5">
              <Heart className="size-3.5 text-purple-500 fill-purple-500" />
              <Label className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                Personne 2
              </Label>
            </div>
          </div>

          {/* Prénom */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={person1.name as string}
              onChange={(e) => update1("name", e.target.value)}
              placeholder="Prénom"
            />
            <Input
              value={person2.name as string}
              onChange={(e) => update2("name", e.target.value)}
              placeholder="Prénom"
            />
          </div>

          {/* Date de naissance */}
          <div className="grid grid-cols-2 gap-2">
            <DatePickerButton
              value={person1.birthdate as Date | undefined}
              onChange={(d) => update1("birthdate", d)}
              zodiac={zodiac1}
              color="pink"
            />
            <DatePickerButton
              value={person2.birthdate as Date | undefined}
              onChange={(d) => update2("birthdate", d)}
              zodiac={zodiac2}
              color="purple"
            />
          </div>

          {/* Questions */}
          {questions.map((q) => (
            <div key={q.key} className="grid grid-cols-2 gap-2">
              <Select
                value={person1[q.key] as string}
                onValueChange={(v) => update1(q.key, v)}
              >
                <SelectTrigger className="w-full">
                  {person1[q.key] ? (
                    <span className="truncate">
                      {getLabel(q.key, person1[q.key] as string)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground truncate">
                      {q.label}
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {q.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={person2[q.key] as string}
                onValueChange={(v) => update2(q.key, v)}
              >
                <SelectTrigger className="w-full">
                  {person2[q.key] ? (
                    <span className="truncate">
                      {getLabel(q.key, person2[q.key] as string)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground truncate">
                      {q.label}
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {q.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Bouton */}
          <Button
            onClick={calculateCompatibility}
            disabled={!allValid}
            className="w-full h-9 gap-2"
          >
            <Sparkles className="size-4" />
            Tester la compatibilité
          </Button>
        </CardContent>
      </Card>

      {/* Résultat */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {result !== null ? (
          <Card
            className={`border-0 shadow-sm bg-gradient-to-br from-white to-pink-50 flex-1 transition-all duration-500 ${showResult ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center h-full gap-5">
              <div
                className={`text-sm text-neutral-500 transition-all duration-700 delay-100 ${showResult ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
              >
                {person1.name as string} ❤️ {person2.name as string}
              </div>

              <div
                className={`text-center transition-all duration-700 delay-200 ${showResult ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              >
                <div
                  className={`text-6xl font-bold tabular-nums ${
                    result >= 60
                      ? "text-pink-600"
                      : result >= 30
                        ? "text-orange-500"
                        : "text-blue-500"
                  }`}
                >
                  <AnimatedScore target={result} />%
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  de compatibilité
                </div>
              </div>

              {zodiac1 && zodiac2 && (
                <div
                  className={`text-xs text-neutral-400 transition-all duration-500 delay-300 ${showResult ? "opacity-100" : "opacity-0"}`}
                >
                  {zodiac1} × {zodiac2}
                </div>
              )}

              <div
                className={`w-full max-w-sm transition-all duration-700 delay-400 ${showResult ? "opacity-100" : "opacity-0"}`}
              >
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out delay-500 ${
                      result >= 75
                        ? "bg-gradient-to-r from-pink-500 to-red-500"
                        : result >= 50
                          ? "bg-gradient-to-r from-orange-400 to-pink-400"
                          : result >= 25
                            ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                            : "bg-gradient-to-r from-blue-400 to-purple-400"
                    }`}
                    style={{ width: showResult ? `${result}%` : "0%" }}
                  />
                </div>
              </div>

              <p
                className={`text-sm font-medium text-neutral-600 text-center max-w-sm transition-all duration-500 delay-700 ${showResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              >
                {getResultEmoji(result)} {getResultMessage(result)}
              </p>

              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < Math.ceil(result / 20);
                  return (
                    <Heart
                      key={i}
                      className={`size-5 transition-all ease-out ${
                        showResult
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-0"
                      } ${filled ? "fill-pink-400 text-pink-400" : "fill-neutral-200 text-neutral-200"}`}
                      style={{
                        transitionDelay: `${800 + i * 100}ms`,
                        transitionDuration: "400ms",
                      }}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-neutral-200 flex-1">
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center space-y-2">
                <Heart className="size-10 text-neutral-300 mx-auto animate-pulse" />
                <p className="text-neutral-400 text-sm">
                  Remplissez les champs et lancez le test
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
