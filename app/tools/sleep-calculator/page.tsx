import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const SleepCalculator = dynamic(() =>
  import("@/components/tools/sleep-calculator").then((mod) => mod.SleepCalculator)
);

export default function SleepCalculatorPage() {
  return (
    <ToolLayout
      title="Calculateur de Sommeil"
      description="Calculez vos heures de coucher et de réveil optimales basées sur les cycles de sommeil"
    >
      <SleepCalculator />
    </ToolLayout>
  );
}
