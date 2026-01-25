import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const AgeCalculator = dynamic(() =>
  import("@/components/tools/age-calculator").then((mod) => mod.AgeCalculator)
);

export default function AgeCalculatorPage() {
  return (
    <ToolLayout
      title="Calculateur d'Âge"
      description="Découvrez votre âge précis avec des statistiques fun"
    >
      <AgeCalculator />
    </ToolLayout>
  );
}
