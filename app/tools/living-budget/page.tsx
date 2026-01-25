import { ToolLayout, FamilyBudgetPlanner } from "@/components/tools";

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
