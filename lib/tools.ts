import {
  Calculator,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  Percent,
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
  {
    id: "salary-calculator",
    title: "Salaire Brut en Net",
    description:
      "Calculez votre salaire net à partir du brut avec prise en compte du prélèvement à la source",
    icon: Calculator,
    href: "/tools/salary-calculator",
    category: "Finance",
    tags: ["salaire", "brut", "net", "impôts", "finance", "paie"],
  },
  {
    id: "vat-calculator",
    title: "Calculateur de TVA",
    description: "Calculez facilement la TVA (HT ⇄ TTC) avec différents taux",
    icon: Percent,
    href: "/tools/vat-calculator",
    category: "Finance",
    tags: ["tva", "taxe", "ht", "ttc", "finance"],
  },
  {
    id: "expense-tracker",
    title: "Suivi des dépenses",
    description: "Suivez et catégorisez vos dépenses mensuelles",
    icon: DollarSign,
    href: "/tools/expense-tracker",
    category: "Finance",
    tags: ["dépenses", "budget", "finance", "économies"],
  },
  {
    id: "invoice-generator",
    title: "Générateur de factures",
    description: "Créez des factures professionnelles en quelques clics",
    icon: FileText,
    href: "/tools/invoice-generator",
    category: "Productivité",
    tags: ["facture", "professionnel", "freelance", "entreprise"],
  },
  {
    id: "time-tracker",
    title: "Suivi du temps",
    description: "Suivez le temps passé sur vos différents projets",
    icon: Clock,
    href: "/tools/time-tracker",
    category: "Productivité",
    tags: ["temps", "productivité", "projet", "freelance"],
  },
  {
    id: "leave-calculator",
    title: "Calcul des congés",
    description: "Calculez vos jours de congés payés et RTT",
    icon: Calendar,
    href: "/tools/leave-calculator",
    category: "RH",
    tags: ["congés", "rtt", "vacances", "travail"],
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
      tool.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  );
}
