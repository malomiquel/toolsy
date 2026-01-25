import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const VatCalculator = dynamic(() =>
  import("@/components/tools/vat-calculator").then((mod) => mod.VatCalculator)
);

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
