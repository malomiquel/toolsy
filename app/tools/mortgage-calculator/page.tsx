import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const MortgageCalculator = dynamic(() =>
  import("@/components/tools/mortgage/mortgage-calculator").then((mod) => mod.MortgageCalculator)
);

export default function MortgageCalculatorPage() {
  return (
    <ToolLayout
      title="Simulateur de Crédit Immobilier"
      description="Calculez vos mensualités et le coût total de votre emprunt"
    >
      <MortgageCalculator />
    </ToolLayout>
  );
}
