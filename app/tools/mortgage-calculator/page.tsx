import { ToolLayout, MortgageCalculator } from "@/components/tools";

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
