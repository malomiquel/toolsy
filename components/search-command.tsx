"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { tools } from "@/lib/tools";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Group tools by category
  const categories = [...new Set(tools.map((tool) => tool.category))];

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-12 w-full max-w-2xl justify-start rounded-xl bg-background px-4 text-muted-foreground shadow-sm"
      >
        <Search className="mr-3 h-4 w-4" />
        <span className="flex-1 text-left">Rechercher un outil...</span>
        <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Rechercher un outil"
        description="Tapez pour rechercher parmi tous les outils disponibles"
      >
        <Command className="rounded-lg border-none">
          <CommandInput placeholder="Rechercher un outil..." />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>Aucun outil trouvé.</CommandEmpty>
            {categories.map((category) => (
              <CommandGroup key={category} heading={category}>
                {tools
                  .filter((tool) => tool.category === category)
                  .map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <CommandItem
                        key={tool.id}
                        value={`${tool.title} ${tool.tags.join(" ")}`}
                        onSelect={() => handleSelect(tool.href)}
                        className="cursor-pointer py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-primary/10 p-2">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{tool.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {tool.description}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
