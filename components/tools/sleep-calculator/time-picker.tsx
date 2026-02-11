"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, setHours] = useState(value.getHours());
  const [minutes, setMinutes] = useState(value.getMinutes());

  useEffect(() => {
    setHours(value.getHours());
    setMinutes(value.getMinutes());
  }, [value]);

  const updateTime = (newHours: number, newMinutes: number) => {
    const newDate = new Date(value);
    newDate.setHours(newHours);
    newDate.setMinutes(newMinutes);
    onChange(newDate);
  };

  const incrementHours = () => {
    const newHours = (hours + 1) % 24;
    setHours(newHours);
    updateTime(newHours, minutes);
  };

  const decrementHours = () => {
    const newHours = (hours - 1 + 24) % 24;
    setHours(newHours);
    updateTime(newHours, minutes);
  };

  const incrementMinutes = () => {
    const newMinutes = (minutes + 1) % 60;
    setMinutes(newMinutes);
    updateTime(hours, newMinutes);
  };

  const decrementMinutes = () => {
    const newMinutes = (minutes - 1 + 60) % 60;
    setMinutes(newMinutes);
    updateTime(hours, newMinutes);
  };

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {/* Hours */}
      <div className="flex flex-col items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={incrementHours}
          className="h-8 w-8 rounded-lg hover:bg-neutral-100"
        >
          <ChevronUp className="size-4 text-neutral-600" />
        </Button>
        <div className="w-16 h-16 flex items-center justify-center bg-white border-2 border-neutral-200 rounded-xl">
          <span className="text-3xl font-bold text-neutral-900 tabular-nums">
            {formatNumber(hours)}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={decrementHours}
          className="h-8 w-8 rounded-lg hover:bg-neutral-100"
        >
          <ChevronDown className="size-4 text-neutral-600" />
        </Button>
      </div>

      {/* Separator */}
      <span className="text-3xl font-bold text-neutral-400 pb-8">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={incrementMinutes}
          className="h-8 w-8 rounded-lg hover:bg-neutral-100"
        >
          <ChevronUp className="size-4 text-neutral-600" />
        </Button>
        <div className="w-16 h-16 flex items-center justify-center bg-white border-2 border-neutral-200 rounded-xl">
          <span className="text-3xl font-bold text-neutral-900 tabular-nums">
            {formatNumber(minutes)}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={decrementMinutes}
          className="h-8 w-8 rounded-lg hover:bg-neutral-100"
        >
          <ChevronDown className="size-4 text-neutral-600" />
        </Button>
      </div>
    </div>
  );
}
