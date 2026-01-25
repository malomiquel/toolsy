import { ToolLayout, SalaryCalculator } from "@/components/tools";

export default function SalaryCalculatorPage() {
  return (
    <ToolLayout
      title="Salaire Brut → Net"
      description="Estimez votre salaire net après charges et impôts"
    >
      <SalaryCalculator />
    </ToolLayout>
  );
}
