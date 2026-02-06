"use client";

import { Euro, Ticket, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { TicketType } from "./types";

interface TicketRowProps {
  ticket: TicketType;
  onUpdate: (
    field: keyof Omit<TicketType, "id">,
    value: string | number,
  ) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function TicketRow({
  ticket,
  onUpdate,
  onRemove,
  canRemove,
}: TicketRowProps) {
  const total = ticket.price * ticket.quantity;
  const isOverCapacity =
    ticket.maxQuantity > 0 && ticket.quantity > ticket.maxQuantity;

  return (
    <div className="flex items-center gap-2 py-2 border-b border-neutral-100 last:border-0">
      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <Ticket className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
      </div>

      <Input
        type="text"
        value={ticket.name}
        onChange={(e) => onUpdate("name", e.target.value)}
        placeholder="Type..."
        className="flex-1 min-w-0"
      />

      <InputGroup className="w-20 shrink-0">
        <InputGroupAddon>
          <Euro className="size-3" />
        </InputGroupAddon>
        <InputGroupInput
          type="number"
          value={ticket.price || ""}
          onChange={(e) => onUpdate("price", Number(e.target.value) || 0)}
          placeholder="Prix"
        />
      </InputGroup>

      <div className="flex items-center gap-1 shrink-0">
        <InputGroup className="w-14">
          <InputGroupInput
            type="number"
            value={ticket.quantity || ""}
            onChange={(e) => onUpdate("quantity", Number(e.target.value) || 0)}
            placeholder="Qté"
          />
        </InputGroup>
        <span className="text-neutral-400 text-xs">/</span>
        <InputGroup className="w-14">
          <InputGroupInput
            type="number"
            value={ticket.maxQuantity || ""}
            onChange={(e) =>
              onUpdate("maxQuantity", Number(e.target.value) || 0)
            }
            placeholder="Max"
          />
        </InputGroup>
      </div>

      <div className="w-20 text-right shrink-0">
        <span
          className={`text-xs font-semibold tabular-nums ${isOverCapacity ? "text-red-500" : "text-emerald-600"}`}
        >
          {total.toLocaleString("fr-FR")} €
        </span>
      </div>

      {canRemove && (
        <Button variant="ghost" size="icon-xs" onClick={onRemove}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
