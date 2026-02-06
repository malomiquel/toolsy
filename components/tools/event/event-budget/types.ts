import type { LucideIcon } from "lucide-react";
import {
  Handshake,
  Building2,
  ShoppingBag,
  Coins,
  MapPin,
  Speaker,
  Sparkles,
  UtensilsCrossed,
  Megaphone,
  Users,
  Truck,
  Shield,
  MoreHorizontal,
} from "lucide-react";

export type TicketType = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
};

export type RevenueItem = {
  id: string;
  label: string;
  amount: number;
  perPerson?: boolean;
  personCount?: number; // Custom person count, if undefined uses totalAttendees
  isHT?: boolean; // If true, amount is HT and will be converted to TTC
  iconKey: string;
  isDefault?: boolean;
};

export type ExpenseItem = {
  id: string;
  label: string;
  amount: number;
  perPerson: boolean;
  personCount?: number; // Custom person count, if undefined uses totalAttendees
  isHT?: boolean; // If true, amount is HT and will be converted to TTC
  iconKey: string;
  isDefault?: boolean;
};

// --- Icon mapping ---
export const ICON_MAP: Record<string, LucideIcon> = {
  handshake: Handshake,
  building: Building2,
  shopping: ShoppingBag,
  coins: Coins,
  mappin: MapPin,
  speaker: Speaker,
  sparkles: Sparkles,
  utensils: UtensilsCrossed,
  megaphone: Megaphone,
  users: Users,
  truck: Truck,
  shield: Shield,
  more: MoreHorizontal,
};

// --- Default Items ---

export const DEFAULT_TICKETS: TicketType[] = [
  { id: "ticket-1", name: "Standard", price: 0, quantity: 0, maxQuantity: 0 },
];

export const DEFAULT_REVENUES: RevenueItem[] = [
  {
    id: "revenue-0",
    label: "Sponsors",
    amount: 0,
    iconKey: "handshake",
    isDefault: true,
  },
  {
    id: "revenue-1",
    label: "Subventions",
    amount: 0,
    iconKey: "building",
    isDefault: true,
  },
  {
    id: "revenue-2",
    label: "Ventes sur place",
    amount: 0,
    iconKey: "shopping",
    isDefault: true,
  },
  {
    id: "revenue-3",
    label: "Autres recettes",
    amount: 0,
    iconKey: "coins",
    isDefault: true,
  },
];

export const DEFAULT_EXPENSES: ExpenseItem[] = [
  {
    id: "expense-0",
    label: "Location lieu",
    amount: 0,
    perPerson: false,
    iconKey: "mappin",
    isDefault: true,
  },
  {
    id: "expense-1",
    label: "Technique (son/lumière)",
    amount: 0,
    perPerson: false,
    iconKey: "speaker",
    isDefault: true,
  },
  {
    id: "expense-2",
    label: "Décoration",
    amount: 0,
    perPerson: false,
    iconKey: "sparkles",
    isDefault: true,
  },
  {
    id: "expense-3",
    label: "Restauration",
    amount: 0,
    perPerson: true,
    iconKey: "utensils",
    isDefault: true,
  },
  {
    id: "expense-4",
    label: "Communication",
    amount: 0,
    perPerson: false,
    iconKey: "megaphone",
    isDefault: true,
  },
  {
    id: "expense-5",
    label: "Personnel",
    amount: 0,
    perPerson: false,
    iconKey: "users",
    isDefault: true,
  },
  {
    id: "expense-6",
    label: "Logistique",
    amount: 0,
    perPerson: false,
    iconKey: "truck",
    isDefault: true,
  },
  {
    id: "expense-7",
    label: "Sécurité",
    amount: 0,
    perPerson: false,
    iconKey: "shield",
    isDefault: true,
  },
];
