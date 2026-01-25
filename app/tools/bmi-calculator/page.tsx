import { ToolLayout, BmiCalculator } from "@/components/tools";

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
