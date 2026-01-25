"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryStates, parseAsInteger, parseAsBoolean } from "nuqs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw, Check, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const SIMILAR = /[ilLI|`oO0]/g;
const AMBIGUOUS = /[{}[\]()/\\'"~,;.<>]/g;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  bgColor: string;
}

function calculateStrength(password: string, length: number, options: {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
}): PasswordStrength {
  let poolSize = 0;
  if (options.lowercase) poolSize += 26;
  if (options.uppercase) poolSize += 26;
  if (options.numbers) poolSize += 10;
  if (options.symbols) poolSize += SYMBOLS.length;

  // Entropy = length * log2(poolSize)
  const entropy = length * Math.log2(poolSize || 1);

  if (entropy < 28) {
    return { score: 1, label: "Très faible", color: "text-red-600", bgColor: "bg-red-500" };
  } else if (entropy < 36) {
    return { score: 2, label: "Faible", color: "text-orange-600", bgColor: "bg-orange-500" };
  } else if (entropy < 60) {
    return { score: 3, label: "Moyen", color: "text-yellow-600", bgColor: "bg-yellow-500" };
  } else if (entropy < 80) {
    return { score: 4, label: "Fort", color: "text-green-600", bgColor: "bg-green-500" };
  } else {
    return { score: 5, label: "Très fort", color: "text-emerald-600", bgColor: "bg-emerald-500" };
  }
}

function generatePassword(
  length: number,
  options: {
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeSimilar: boolean;
    excludeAmbiguous: boolean;
  }
): string {
  let chars = "";
  let requiredChars = "";

  if (options.lowercase) {
    chars += LOWERCASE;
    requiredChars += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];
  }
  if (options.uppercase) {
    chars += UPPERCASE;
    requiredChars += UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)];
  }
  if (options.numbers) {
    chars += NUMBERS;
    requiredChars += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  }
  if (options.symbols) {
    chars += SYMBOLS;
    requiredChars += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }

  if (options.excludeSimilar) {
    chars = chars.replaceAll(SIMILAR, "");
  }
  if (options.excludeAmbiguous) {
    chars = chars.replaceAll(AMBIGUOUS, "");
  }

  if (!chars) {
    return "";
  }

  // Generate remaining characters
  const remainingLength = Math.max(0, length - requiredChars.length);
  let password = requiredChars;

  for (let i = 0; i < remainingLength; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle password
  return [...password]
    .toSorted(() => Math.random() - 0.5)
    .join("");
}

export function PasswordGenerator() {
  const [params, setParams] = useQueryStates(
    {
      length: parseAsInteger.withDefault(16),
      lowercase: parseAsBoolean.withDefault(true),
      uppercase: parseAsBoolean.withDefault(true),
      numbers: parseAsBoolean.withDefault(true),
      symbols: parseAsBoolean.withDefault(true),
      excludeSimilar: parseAsBoolean.withDefault(false),
      excludeAmbiguous: parseAsBoolean.withDefault(false),
    },
    { history: "replace" }
  );

  const { length, lowercase, uppercase, numbers, symbols, excludeSimilar, excludeAmbiguous } = params;

  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const newPassword = generatePassword(length, {
      lowercase,
      uppercase,
      numbers,
      symbols,
      excludeSimilar,
      excludeAmbiguous,
    });
    setPassword(newPassword);
    setCopied(false);
  }, [length, lowercase, uppercase, numbers, symbols, excludeSimilar, excludeAmbiguous]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = password;
      document.body.append(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const strength = calculateStrength(password, length, { lowercase, uppercase, numbers, symbols });

  const atLeastOneSelected = lowercase || uppercase || numbers || symbols;

  const StrengthIcon = strength.score <= 2 ? ShieldAlert : strength.score <= 3 ? Shield : ShieldCheck;

  return (
    <div className="h-full grid lg:grid-cols-3 gap-6">
      {/* Left: Options */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-5 space-y-6">
          {/* Length */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Longueur
              </Label>
              <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                {length} caractères
              </span>
            </div>
            <Slider
              value={[length]}
              onValueChange={(v) => setParams({ length: Array.isArray(v) ? v[0] : v })}
              min={4}
              max={64}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-1.5 text-xs text-neutral-400">
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          {/* Character types */}
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide block mb-3">
              Caractères inclus
            </Label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={lowercase}
                  onCheckedChange={(v) => setParams({ lowercase: !!v })}
                />
                <span className="text-sm text-neutral-700">Minuscules (a-z)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={uppercase}
                  onCheckedChange={(v) => setParams({ uppercase: !!v })}
                />
                <span className="text-sm text-neutral-700">Majuscules (A-Z)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={numbers}
                  onCheckedChange={(v) => setParams({ numbers: !!v })}
                />
                <span className="text-sm text-neutral-700">Chiffres (0-9)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={symbols}
                  onCheckedChange={(v) => setParams({ symbols: !!v })}
                />
                <span className="text-sm text-neutral-700">Symboles (!@#$...)</span>
              </label>
            </div>
          </div>

          {/* Exclusions */}
          <div>
            <Label className="text-xs text-neutral-500 uppercase tracking-wide block mb-3">
              Exclusions
            </Label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={excludeSimilar}
                  onCheckedChange={(v) => setParams({ excludeSimilar: !!v })}
                />
                <span className="text-sm text-neutral-700">Similaires (i, l, 1, L, o, 0, O)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={excludeAmbiguous}
                  onCheckedChange={(v) => setParams({ excludeAmbiguous: !!v })}
                />
                <span className="text-sm text-neutral-700">{"Ambigus ({ } [ ] ( ) / \\ ' \" ~)"}</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right: Result */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Password display */}
        <div className="bg-neutral-900 rounded-2xl p-6 flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            {atLeastOneSelected ? (
              <div className="w-full">
                <p
                  className="text-xl md:text-2xl font-mono text-white text-center break-all leading-relaxed select-all"
                  style={{ wordBreak: "break-all" }}
                >
                  {password}
                </p>
              </div>
            ) : (
              <p className="text-neutral-500 text-center">
                Sélectionnez au moins un type de caractère
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={copyToClipboard}
              disabled={!atLeastOneSelected}
              className="flex-1 h-12 bg-white text-neutral-900 hover:bg-neutral-100"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </>
              )}
            </Button>
            <Button
              onClick={generate}
              disabled={!atLeastOneSelected}
              className="flex-1 h-12 bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Générer
            </Button>
          </div>
        </div>

        {/* Strength indicator */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${strength.bgColor} bg-opacity-10`}>
                <StrengthIcon className={`w-6 h-6 ${strength.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">
                    Force du mot de passe
                  </span>
                  <span className={`text-sm font-semibold ${strength.color}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.bgColor} transition-all duration-300`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">
                {strength.score < 3 && "Conseil : Augmentez la longueur ou ajoutez plus de types de caractères."}
                {strength.score === 3 && "Conseil : Un mot de passe plus long serait encore plus sécurisé."}
                {strength.score === 4 && "Bon mot de passe ! Ajoutez des symboles pour plus de sécurité."}
                {strength.score === 5 && "Excellent ! Ce mot de passe est très difficile à deviner."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
