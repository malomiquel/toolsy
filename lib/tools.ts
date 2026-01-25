import {
  Calculator,
  Wallet,
  Percent,
  Home,
  Ruler,
  type LucideIcon,
} from "lucide-react";

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: string;
  tags: string[];
}

export const tools: Tool[] = [
  // Finance
  {
    id: "salary-calculator",
    title: "Salaire Brut en Net",
    description:
      "Calculez votre salaire net à partir du brut avec prise en compte des charges",
    icon: Calculator,
    href: "/tools/salary-calculator",
    category: "Finance",
    tags: ["salaire", "brut", "net", "impôts", "paie"],
  },
  {
    id: "vat-calculator",
    title: "Calculateur de TVA",
    description: "Calculez facilement la TVA (HT ⇄ TTC) avec différents taux",
    icon: Percent,
    href: "/tools/vat-calculator",
    category: "Finance",
    tags: ["tva", "taxe", "ht", "ttc"],
  },
  {
    id: "living-budget-calculator",
    title: "Budget Familial",
    description:
      "Gérez vos revenus et dépenses pour optimiser votre épargne mensuelle",
    icon: Wallet,
    href: "/tools/living-budget",
    category: "Finance",
    tags: ["budget", "dépenses", "épargne", "famille"],
  },
  // Immobilier
  {
    id: "mortgage-calculator",
    title: "Simulateur de Crédit Immobilier",
    description:
      "Calculez vos mensualités, le coût total et les intérêts de votre emprunt",
    icon: Home,
    href: "/tools/mortgage-calculator",
    category: "Immobilier",
    tags: ["crédit", "emprunt", "immobilier", "mensualité", "taux"],
  },
  // Quotidien
  {
    id: "size-converter",
    title: "Convertisseur de Tailles",
    description:
      "Convertissez les tailles de vêtements et chaussures entre EU, UK et US",
    icon: Ruler,
    href: "/tools/size-converter",
    category: "Quotidien",
    tags: ["taille", "vêtements", "chaussures", "conversion", "eu", "uk", "us"],
  },
];

export function getToolById(id: string): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function searchTools(query: string): Tool[] {
  const lowercaseQuery = query.toLowerCase();
  return tools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
}
