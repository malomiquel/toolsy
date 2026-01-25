import { ToolLayout, VatCalculator } from "@/components/tools";

export default function VatCalculatorPage() {
  return (
    <ToolLayout
      title="Calculateur TVA"
      description="Convertissez entre HT et TTC instantanément"
    >
      <VatCalculator />
    </ToolLayout>
  );
}
