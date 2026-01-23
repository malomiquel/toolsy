"use client";

import { useState, useMemo } from "react";
import { tools, searchTools } from "@/lib/tools";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";

export function ToolsGrid() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    return searchTools(searchQuery);
  }, [searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(tools.map((tool) => tool.category));
    return Array.from(cats);
  }, []);

  const groupedTools = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category] = filteredTools.filter((tool) => tool.category === category);
      return acc;
    }, {} as Record<string, typeof tools>);
  }, [categories, filteredTools]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Toolsy
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Votre boîte à outils française pour simplifier votre quotidien
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un outil... (salaire, tva, facture...)"
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tools Grid by Category */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Aucun outil trouvé pour "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryTools = groupedTools[category];
              if (categoryTools.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="mb-6 text-2xl font-semibold">{category}</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link key={tool.id} href={tool.href} className="group">
                          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                            <CardHeader>
                              <div className="mb-3 flex items-center justify-between">
                                <div className="rounded-lg bg-primary/10 p-3">
                                  <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <Badge variant="secondary">{tool.category}</Badge>
                              </div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {tool.title}
                              </CardTitle>
                              <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {tool.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
