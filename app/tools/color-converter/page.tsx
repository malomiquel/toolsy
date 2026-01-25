import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const ColorConverter = dynamic(() =>
  import("@/components/tools/color-converter").then((mod) => mod.ColorConverter)
);

export default function ColorConverterPage() {
  return (
    <ToolLayout
      title="Convertisseur de Couleurs"
      description="Convertissez entre HEX, RGB, HSL et OKLCH"
    >
      <ColorConverter />
    </ToolLayout>
  );
}
