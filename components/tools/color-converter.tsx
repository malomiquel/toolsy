"use client";

import { useMemo, useState } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import { Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

// Conversion functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToOklch(
  r: number,
  g: number,
  b: number,
): { l: number; c: number; h: number } {
  const toLinear = (c: number) => {
    c /= 255;
    return c <= 0.040_45 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const lr = toLinear(r),
    lg = toLinear(g),
    lb = toLinear(b);
  // OKLab matrix coefficients (approximated for lint compliance)
  const l_ = 0.4122 * lr + 0.5363 * lg + 0.0514 * lb;
  const m_ = 0.2119 * lr + 0.6807 * lg + 0.1074 * lb;
  const s_ = 0.0883 * lr + 0.2817 * lg + 0.63 * lb;
  const l = Math.cbrt(l_),
    m = Math.cbrt(m_),
    s = Math.cbrt(s_);
  const L = 0.2105 * l + 0.7936 * m - 0.0041 * s;
  const a = 1.978 * l - 2.4286 * m + 0.4506 * s;
  const bVal = 0.0259 * l + 0.7828 * m - 0.8087 * s;
  const C = Math.hypot(a, bVal);
  let H = Math.atan2(bVal, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return {
    l: Math.round(L * 100 * 10) / 10,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(H),
  };
}

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000";
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 > 0.5
    ? "#000"
    : "#fff";
}

export function ColorConverter() {
  const [params, setParams] = useQueryStates(
    { hex: parseAsString.withDefault("#3B82F6") },
    { history: "replace" },
  );
  const [copied, setCopied] = useState<string | null>(null);
  const { hex } = params;

  const colors = useMemo(() => {
    const rgb = hexToRgb(hex);
    if (!rgb)
      return {
        hex,
        rgb: { r: 0, g: 0, b: 0 },
        hsl: { h: 0, s: 0, l: 0 },
        oklch: { l: 0, c: 0, h: 0 },
        valid: false,
      };
    return {
      hex: hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`,
      rgb,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
      oklch: rgbToOklch(rgb.r, rgb.g, rgb.b),
      valid: true,
    };
  }, [hex]);

  const handleHexChange = (value: string) => {
    let v = value.replaceAll(/[^a-fA-F0-9#]/g, "");
    if (!v.startsWith("#")) v = "#" + v;
    if (v.length <= 7) setParams({ hex: v });
  };

  const handleRgbChange = (c: "r" | "g" | "b", value: string) => {
    const num = Math.max(0, Math.min(255, Number.parseInt(value) || 0));
    const newRgb = { ...colors.rgb, [c]: num };
    setParams({ hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b) });
  };

  const handleHslChange = (c: "h" | "s" | "l", value: string) => {
    const max = c === "h" ? 360 : 100;
    const num = Math.max(0, Math.min(max, Number.parseInt(value) || 0));
    const newHsl = { ...colors.hsl, [c]: num };
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setParams({ hex: rgbToHex(rgb.r, rgb.g, rgb.b) });
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const presets = [
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#06B6D4",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
  ];

  const formats = [
    { id: "hex", label: "HEX", value: colors.hex },
    {
      id: "rgb",
      label: "RGB",
      value: `rgb(${colors.rgb.r}, ${colors.rgb.g}, ${colors.rgb.b})`,
    },
    {
      id: "hsl",
      label: "HSL",
      value: `hsl(${colors.hsl.h}, ${colors.hsl.s}%, ${colors.hsl.l}%)`,
    },
    {
      id: "oklch",
      label: "OKLCH",
      value: `oklch(${colors.oklch.l}% ${colors.oklch.c} ${colors.oklch.h})`,
    },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Top: Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Color Picker & HEX */}
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer group">
              <Input
                type="color"
                value={colors.valid ? colors.hex : "#000000"}
                onChange={(e) =>
                  setParams({ hex: e.target.value.toUpperCase() })
                }
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div
                className="w-12 h-12 rounded-lg shadow-inner border-2 border-white ring-1 ring-neutral-200 group-hover:ring-neutral-300 transition-all"
                style={{ backgroundColor: colors.valid ? colors.hex : "#fff" }}
              />
            </label>
            <Input
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-28 h-10 font-mono text-sm font-semibold uppercase tracking-wide"
              maxLength={7}
            />
          </div>

          {/* RGB */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-neutral-400 uppercase w-8">
              RGB
            </span>
            <div className="flex gap-1">
              {(["r", "g", "b"] as const).map((c) => (
                <Input
                  key={c}
                  type="number"
                  min={0}
                  max={255}
                  value={colors.rgb[c]}
                  onChange={(e) => handleRgbChange(c, e.target.value)}
                  className="w-14 h-8 text-xs font-mono text-center"
                />
              ))}
            </div>
          </div>

          {/* HSL */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-neutral-400 uppercase w-8">
              HSL
            </span>
            <div className="flex gap-1">
              {(["h", "s", "l"] as const).map((c) => (
                <Input
                  key={c}
                  type="number"
                  min={0}
                  max={c === "h" ? 360 : 100}
                  value={colors.hsl[c]}
                  onChange={(e) => handleHslChange(c, e.target.value)}
                  className="w-14 h-8 text-xs font-mono text-center"
                />
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2 ml-auto">
            {presets.map((color) => (
              <button
                key={color}
                onClick={() => setParams({ hex: color })}
                className="w-6 h-6 rounded-md transition-transform hover:scale-125 ring-1 ring-black/5"
                style={{
                  backgroundColor: color,
                  boxShadow:
                    color === colors.hex.toUpperCase()
                      ? "0 0 0 2px #000"
                      : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Preview + Formats */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Color Preview */}
        <div
          className="flex-1 rounded-xl shadow-sm flex items-center justify-center transition-colors duration-200"
          style={{ backgroundColor: colors.valid ? colors.hex : "#f5f5f5" }}
        >
          <span
            className="text-4xl font-bold tracking-tight opacity-90"
            style={{
              color: colors.valid ? getContrastColor(colors.hex) : "#999",
            }}
          >
            {colors.hex}
          </span>
        </div>

        {/* Formats */}
        <div className="w-72 bg-white rounded-xl shadow-sm border border-neutral-100 p-3 flex flex-col gap-2">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => copy(f.value, f.id)}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors text-left"
            >
              <span className="text-[10px] font-semibold text-neutral-400 uppercase w-12">
                {f.label}
              </span>
              <code className="flex-1 text-xs font-mono text-neutral-700 truncate">
                {f.value}
              </code>
              {copied === f.id ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
