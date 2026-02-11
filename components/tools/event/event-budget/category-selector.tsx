"use client";

import { ExpenseCategory } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag } from "lucide-react";

interface CategorySelectorProps {
  categories: ExpenseCategory[];
  selectedCategoryId?: string;
  onSelect: (categoryId: string | null) => void;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
}: CategorySelectorProps) {
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <Select
      value={selectedCategoryId || "none"}
      onValueChange={onSelect}
    >
      <SelectTrigger className="w-40 h-7 text-xs shrink-0">
        <SelectValue placeholder="Catégorie">
          {selectedCategory ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="truncate">{selectedCategory.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Tag className="w-3 h-3" />
              <span>Catégorie</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectItem value="none">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Tag className="w-3 h-3" />
            <span>Aucune catégorie</span>
          </div>
        </SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span>{category.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
