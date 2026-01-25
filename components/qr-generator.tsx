"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Copy, Check, Link, Mail, Phone, Wifi } from "lucide-react";

const PRESETS = [
  { id: "text", label: "Texte libre", icon: Link, placeholder: "Entrez votre texte..." },
  { id: "url", label: "URL", icon: Link, placeholder: "https://example.com" },
  { id: "email", label: "Email", icon: Mail, placeholder: "contact@example.com" },
  { id: "phone", label: "Téléphone", icon: Phone, placeholder: "+33 6 12 34 56 78" },
  { id: "wifi", label: "WiFi", icon: Wifi, placeholder: "SSID:MonWifi;T:WPA;P:motdepasse;;" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

const PRESET_LABELS: Record<PresetId, string> = {
  text: "Texte libre",
  url: "URL",
  email: "Email",
  phone: "Téléphone",
  wifi: "WiFi",
};

function formatContent(preset: PresetId, content: string): string {
  switch (preset) {
    case "url":
      return content.startsWith("http") ? content : `https://${content}`;
    case "email":
      return `mailto:${content}`;
    case "phone":
      return `tel:${content.replaceAll(" ", "")}`;
    case "wifi":
      return `WIFI:${content}`;
    default:
      return content;
  }
}

export function QrGenerator() {
  const [params, setParams] = useQueryStates(
    {
      preset: parseAsString.withDefault("text"),
      content: parseAsString.withDefault(""),
      size: parseAsInteger.withDefault(256),
    },
    { history: "replace" }
  );

  const preset = params.preset as PresetId;
  const { content, size } = params;
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const currentPreset = PRESETS.find((p) => p.id === preset) || PRESETS[0];

  const generateQR = useCallback(async () => {
    if (!content.trim()) {
      setQrDataUrl("");
      return;
    }

    try {
      const formattedContent = formatContent(preset as PresetId, content);
      const dataUrl = await QRCode.toDataURL(formattedContent, {
        width: size,
        margin: 2,
        color: {
          dark: "#171717",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
    } catch {
      setQrDataUrl("");
    }
  }, [content, preset, size]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy the data URL
      try {
        await navigator.clipboard.writeText(qrDataUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silently fail
      }
    }
  };

  return (
    <div className="h-full grid lg:grid-cols-3 gap-6">
      {/* Left: Inputs */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5 space-y-5">
          {/* Preset */}
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide">
              Type de contenu
            </Label>
            <Select
              value={preset}
              onValueChange={(v) => setParams({ preset: v as PresetId, content: "" })}
            >
              <SelectTrigger className="mt-1.5 h-10 border-neutral-200">
                <SelectValue>{PRESET_LABELS[preset as PresetId]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <p.icon className="w-4 h-4" />
                      {p.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide">
              Contenu
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setParams({ content: e.target.value })}
              placeholder={currentPreset.placeholder}
              className="mt-1.5 min-h-[120px] resize-none border-neutral-200"
            />
          </div>

          {/* Size */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Taille
              </Label>
              <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                {size} px
              </span>
            </div>
            <Slider
              value={[size]}
              onValueChange={(v) => setParams({ size: Array.isArray(v) ? v[0] : v })}
              min={128}
              max={512}
              step={32}
              className="w-full"
            />
            <div className="flex justify-between mt-1.5 text-xs text-neutral-400">
              <span>128</span>
              <span>512</span>
            </div>
          </div>

          {/* WiFi helper */}
          {preset === "wifi" && (
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-600">
                <strong>Format WiFi :</strong><br />
                SSID:NomDuReseau;T:WPA;P:MotDePasse;;
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                T: WPA, WEP ou nopass
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: QR Code */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* QR Display */}
        <div className="bg-neutral-900 rounded-2xl p-6 flex-1 flex flex-col items-center justify-center">
          {qrDataUrl ? (
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-full max-w-[300px] h-auto"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-48 h-48 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <currentPreset.icon className="w-16 h-16 text-neutral-600" />
              </div>
              <p className="text-neutral-500">
                Entrez du contenu pour générer un QR code
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Button
                onClick={downloadQR}
                disabled={!qrDataUrl}
                className="flex-1 h-11 bg-neutral-900 text-white hover:bg-neutral-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PNG
              </Button>
              <Button
                onClick={copyToClipboard}
                disabled={!qrDataUrl}
                variant="outline"
                className="flex-1 h-11 border-neutral-200"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copier l&apos;image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
