import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const EventBudget = dynamic(() =>
  import("@/components/tools/event/event-budget/event-budget").then(
    (mod) => mod.EventBudget,
  ),
);

export default function EventBudgetPage() {
  return (
    <ToolLayout
      title="Budget Événement"
      description="Gérez les recettes et dépenses de votre événement"
    >
      <Suspense fallback={<div className="h-full animate-pulse bg-neutral-100 rounded-xl" />}>
        <EventBudget />
      </Suspense>
    </ToolLayout>
  );
}
