import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const FamilyBudgetPlanner = dynamic(() =>
  import("@/components/tools/living-budget-calculator").then((mod) => mod.FamilyBudgetPlanner)
);

export default function LivingBudgetPage() {
  return (
    <ToolLayout
      title="Budget Familial"
      description="Analysez vos finances et optimisez votre épargne"
    >
      <FamilyBudgetPlanner />
    </ToolLayout>
  );
}
