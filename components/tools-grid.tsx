"use client";

import { useState, useMemo } from "react";
import { tools } from "@/lib/tools";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchCommand } from "@/components/search-command";
import Link from "next/link";

export function ToolsGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    for (const tool of tools) {
      cats.set(tool.category, (cats.get(tool.category) || 0) + 1);
    }
    return [...cats.entries()].map(([name, count]) => ({ name, count }));
  }, []);

  const filteredTools = useMemo(() => {
    if (selectedCategory) {
      return tools.filter((tool) => tool.category === selectedCategory);
    }
    return tools;
  }, [selectedCategory]);

  const groupedTools = useMemo(() => {
    const groups: Record<string, typeof tools> = {};
    for (const tool of filteredTools) {
      if (!groups[tool.category]) {
        groups[tool.category] = [];
      }
      groups[tool.category].push(tool);
    }
    return groups;
  }, [filteredTools]);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Toolsy
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Votre boîte à outils française — {tools.length} outils disponibles
          </p>
        </div>

        {/* Search Command */}
        <div className="mb-8 flex justify-center">
          <SearchCommand />
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            Tous ({tools.length})
          </Button>
          {categories.map(({ name, count }) => (
            <Button
              key={name}
              variant={selectedCategory === name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(name)}
              className="rounded-full"
            >
              {name} ({count})
            </Button>
          ))}
        </div>

        {/* Active filter indicator */}
        {selectedCategory && (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>
              {filteredTools.length} outil{filteredTools.length > 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="h-auto py-1 px-2 text-xs"
            >
              Voir tous
            </Button>
          </div>
        )}

        {/* Tools Grid */}
        <div className="space-y-10">
          {Object.entries(groupedTools).map(([category, categoryTools]) => (
            <section key={category}>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-semibold">{category}</h2>
                <Badge variant="secondary" className="rounded-full">
                  {categoryTools.length}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} href={tool.href} className="group">
                      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5">
                        <CardHeader className="pb-2">
                          <div className="rounded-lg bg-primary/10 p-2.5 w-fit mb-3">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                            {tool.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="line-clamp-2 text-sm">
                            {tool.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Appuyez sur{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              ⌘K
            </kbd>{" "}
            pour rechercher rapidement
          </p>
        </div>
      </div>
    </div>
  );
}
