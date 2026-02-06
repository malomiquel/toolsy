import {
  Calculator,
  Wallet,
  Percent,
  Home,
  Ruler,
  KeyRound,
  Scale,
  QrCode,
  Palette,
  Cake,
  FileStack,
  PartyPopper,
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
  {
    id: "mortgage-calculator",
    title: "Simulateur de Crédit Immobilier",
    description:
      "Calculez vos mensualités, le coût total et les intérêts de votre emprunt",
    icon: Home,
    href: "/tools/mortgage-calculator",
    category: "Finance",
    tags: ["crédit", "emprunt", "immobilier", "mensualité", "taux"],
  },
  {
    id: "event-budget",
    title: "Budget Événement",
    description:
      "Planifiez les recettes et dépenses de votre événement pour maîtriser votre budget",
    icon: PartyPopper,
    href: "/tools/event-budget",
    category: "Événementiel",
    tags: ["événement", "budget", "recettes", "dépenses", "fête", "organisation"],
  },
  // Convertisseurs
  {
    id: "size-converter",
    title: "Convertisseur de Tailles",
    description:
      "Convertissez les tailles de vêtements et chaussures entre EU, UK et US",
    icon: Ruler,
    href: "/tools/size-converter",
    category: "Convertisseurs",
    tags: ["taille", "vêtements", "chaussures", "conversion", "eu", "uk", "us"],
  },
  {
    id: "color-converter",
    title: "Convertisseur de Couleurs",
    description:
      "Convertissez facilement entre HEX, RGB et HSL avec aperçu en temps réel",
    icon: Palette,
    href: "/tools/color-converter",
    category: "Convertisseurs",
    tags: ["couleur", "hex", "rgb", "hsl", "css", "design"],
  },
  // Générateurs
  {
    id: "password-generator",
    title: "Générateur de Mot de Passe",
    description:
      "Créez des mots de passe sécurisés avec options de personnalisation",
    icon: KeyRound,
    href: "/tools/password-generator",
    category: "Générateurs",
    tags: ["mot de passe", "password", "sécurité", "générateur"],
  },
  {
    id: "qr-generator",
    title: "Générateur de QR Code",
    description:
      "Créez des QR codes pour texte, URL, email, téléphone ou WiFi",
    icon: QrCode,
    href: "/tools/qr-generator",
    category: "Générateurs",
    tags: ["qr code", "qrcode", "lien", "url", "wifi"],
  },
  // Documents
  {
    id: "pdf-manager",
    title: "Gestionnaire d'Images et PDF",
    description:
      "Créez des cartes à découper, compressez vos images et fusionnez vos documents en quelques clics",
    icon: FileStack,
    href: "/tools/pdf-manager",
    category: "Documents",
    tags: ["image", "pdf", "carte", "impression", "découpe", "compression", "fusion"],
  },
  // Santé
  {
    id: "bmi-calculator",
    title: "Calculateur d'IMC",
    description:
      "Calculez votre Indice de Masse Corporelle et découvrez votre poids idéal",
    icon: Scale,
    href: "/tools/bmi-calculator",
    category: "Santé",
    tags: ["imc", "poids", "taille", "santé", "masse corporelle"],
  },
  {
    id: "age-calculator",
    title: "Calculateur d'Âge",
    description:
      "Découvrez votre âge précis en temps réel avec des statistiques fun",
    icon: Cake,
    href: "/tools/age-calculator",
    category: "Santé",
    tags: ["âge", "anniversaire", "naissance", "temps", "statistiques"],
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
