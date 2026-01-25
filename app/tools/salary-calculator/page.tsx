import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const SalaryCalculator = dynamic(() =>
  import("@/components/tools/salary-calculator").then((mod) => mod.SalaryCalculator)
);

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
