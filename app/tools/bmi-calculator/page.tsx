import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const BmiCalculator = dynamic(() =>
  import("@/components/tools/bmi-calculator").then((mod) => mod.BmiCalculator)
);

export default function BmiCalculatorPage() {
  return (
    <ToolLayout
      title="Calculateur d'IMC"
      description="Calculez votre Indice de Masse Corporelle"
    >
      <BmiCalculator />
    </ToolLayout>
  );
}
