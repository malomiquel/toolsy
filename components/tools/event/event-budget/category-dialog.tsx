"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { ExpenseCategory } from "./types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ExpenseCategory[];
  onAddCategory: (name: string, color: string) => void;
  onRemoveCategory: (id: string) => void;
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#10b981", // emerald
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
  "#6b7280", // gray
  "#14b8a6", // teal
];

export function CategoryDialog({
  open,
  onOpenChange,
  categories,
  onAddCategory,
  onRemoveCategory,
}: CategoryDialogProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const canAdd = useMemo(() => newName.trim().length > 0, [newName]);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAddCategory(name, newColor);
    setNewName("");
    setNewColor(PRESET_COLORS[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Gérer les catégories</DialogTitle>
          <DialogDescription>
            Crée une catégorie et attribue-lui une couleur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Create */}
          <div className="space-y-3">
            <Label htmlFor="category-name">Nouvelle catégorie</Label>

            <div className="flex gap-2">
              <Input
                id="category-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Nourriture"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={!canAdd}>
                Ajouter
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="grid grid-cols-12 gap-2">
                {PRESET_COLORS.map((color) => {
                  const selected = newColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      aria-pressed={selected}
                      className={[
                        "h-7 w-7 rounded-md border",
                        "transition focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2",
                        selected
                          ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2"
                          : "border-neutral-200 hover:border-neutral-400",
                      ].join(" ")}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Existing */}
          <div className="space-y-2">
            <Label>Catégories existantes</Label>

            <ScrollArea className="h-64 rounded-md border border-neutral-200">
              <div className="p-2 space-y-1">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-neutral-50"
                  >
                    <div
                      className="h-3.5 w-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-sm">{category.name}</span>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveCategory(category.id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                      aria-label={`Supprimer ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {categories.length === 0 && (
                  <p className="text-sm text-neutral-500 text-center py-8">
                    Aucune catégorie
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
