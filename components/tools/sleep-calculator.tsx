"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TimePicker } from "./sleep-calculator/time-picker";
import { Moon, Sun, AlarmClock, Clock, Lightbulb } from "lucide-react";

// Un cycle de sommeil dure environ 90 minutes
const CYCLE_DURATION = 90;
const FALL_ASLEEP_TIME = 14; // Temps moyen pour s'endormir

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function SleepCalculator() {
  const [mode, setMode] = useState<"wakeup" | "bedtime">("wakeup");

  // Mode 1: Je veux me réveiller à...
  const defaultWakeTime = new Date();
  defaultWakeTime.setHours(7, 0, 0, 0);
  const [wakeTime, setWakeTime] = useState<Date>(defaultWakeTime);
  const [bedtimes, setBedtimes] = useState<Date[]>([]);

  // Mode 2: Je vais me coucher à...
  const defaultSleepTime = new Date();
  defaultSleepTime.setHours(23, 0, 0, 0);
  const [sleepTime, setSleepTime] = useState<Date>(defaultSleepTime);
  const [wakeupTimes, setWakeupTimes] = useState<Date[]>([]);

  const calculateBedtimes = () => {
    const times: Date[] = [];
    // Générer 6 cycles (3h à 9h de sommeil)
    for (let cycles = 6; cycles >= 4; cycles--) {
      const totalMinutes = cycles * CYCLE_DURATION + FALL_ASLEEP_TIME;
      const bedtime = addMinutes(wakeTime, -totalMinutes);
      times.push(bedtime);
    }
    setBedtimes(times);
  };

  const calculateWakeupTimes = () => {
    const fellAsleep = addMinutes(sleepTime, FALL_ASLEEP_TIME);

    const times: Date[] = [];
    // Générer 6 cycles
    for (let cycles = 4; cycles <= 6; cycles++) {
      const totalMinutes = cycles * CYCLE_DURATION;
      const wake = addMinutes(fellAsleep, totalMinutes);
      times.push(wake);
    }
    setWakeupTimes(times);
  };

  const getCycleLabel = (index: number, total: number) => {
    const cycles = mode === "wakeup" ? 6 - index : 4 + index;
    const hours = (cycles * 90) / 60;
    return `${cycles} cycles (${hours}h)`;
  };

  const getCycleQuality = (cycles: number) => {
    if (cycles === 5) return { label: "Optimal", color: "text-green-600 bg-green-50" };
    if (cycles === 6) return { label: "Idéal", color: "text-emerald-600 bg-emerald-50" };
    if (cycles === 4) return { label: "Minimum", color: "text-orange-600 bg-orange-50" };
    return { label: "Bon", color: "text-blue-600 bg-blue-50" };
  };

  return (
    <div className="h-full grid lg:grid-cols-5 gap-6">
      {/* Left: Inputs */}
      <Card className="lg:col-span-2 border-0 shadow-sm bg-white overflow-auto">
        <CardContent className="p-5">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "wakeup" | "bedtime")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="wakeup" className="gap-2">
                <Sun className="size-4" />
                Me réveiller à
              </TabsTrigger>
              <TabsTrigger value="bedtime" className="gap-2">
                <Moon className="size-4" />
                Me coucher à
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wakeup" className="space-y-5">
              <div>
                <Label className="text-xs text-neutral-500 uppercase tracking-wide mb-3 block text-center">
                  À quelle heure voulez-vous vous réveiller ?
                </Label>
                <div className="flex justify-center py-2">
                  <TimePicker value={wakeTime} onChange={setWakeTime} />
                </div>
              </div>

              <Button onClick={calculateBedtimes} className="w-full gap-2 h-11">
                <AlarmClock className="size-4" />
                Calculer les heures de coucher
              </Button>

              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-start gap-2 text-xs text-neutral-600 bg-blue-50 p-3 rounded-lg">
                  <Lightbulb className="size-4 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Le sommeil fonctionne par cycles de 90 minutes. Se réveiller entre deux cycles vous aide à vous sentir plus reposé.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bedtime" className="space-y-5">
              <div>
                <Label className="text-xs text-neutral-500 uppercase tracking-wide mb-3 block text-center">
                  À quelle heure allez-vous vous coucher ?
                </Label>
                <div className="flex justify-center py-2">
                  <TimePicker value={sleepTime} onChange={setSleepTime} />
                </div>
              </div>

              <Button onClick={calculateWakeupTimes} className="w-full gap-2 h-11">
                <AlarmClock className="size-4" />
                Calculer les heures de réveil
              </Button>

              <div className="pt-2 border-t border-neutral-100">
                <div className="flex items-start gap-2 text-xs text-neutral-600 bg-purple-50 p-3 rounded-lg">
                  <Lightbulb className="size-4 text-purple-500 shrink-0 mt-0.5" />
                  <p>
                    On met en moyenne 14 minutes à s'endormir. Les heures proposées tiennent compte de ce délai.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Right: Results */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {mode === "wakeup" && bedtimes.length > 0 ? (
          <Card className="border-0 shadow-sm bg-white flex-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Moon className="size-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-neutral-800">
                  Heures de coucher recommandées
                </h3>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Pour vous réveiller à <span className="font-semibold text-blue-600">{formatTime(wakeTime)}</span>, vous devriez vous coucher à :
              </p>
              <div className="space-y-2">
                {bedtimes.map((time, index) => {
                  const cycles = 6 - index;
                  const quality = getCycleQuality(cycles);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="size-5 text-neutral-400" />
                        <div>
                          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
                            {formatTime(time)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {getCycleLabel(index, bedtimes.length)}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${quality.color}`}>
                        {quality.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : mode === "bedtime" && wakeupTimes.length > 0 ? (
          <Card className="border-0 shadow-sm bg-white flex-1">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sun className="size-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-neutral-800">
                  Heures de réveil recommandées
                </h3>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Si vous vous couchez à <span className="font-semibold text-purple-600">{formatTime(sleepTime)}</span>, vous devriez vous réveiller à :
              </p>
              <div className="space-y-2">
                {wakeupTimes.map((time, index) => {
                  const cycles = 4 + index;
                  const quality = getCycleQuality(cycles);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="size-5 text-neutral-400" />
                        <div>
                          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
                            {formatTime(time)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {getCycleLabel(index, wakeupTimes.length)}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${quality.color}`}>
                        {quality.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-neutral-200 flex-1">
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center space-y-3">
                <Moon className="size-12 text-neutral-300 mx-auto" />
                <p className="text-neutral-400 text-sm">
                  Choisissez un mode et calculez vos heures de sommeil idéales
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
