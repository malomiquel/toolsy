import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const LoveCompatibility = dynamic(() =>
  import("@/components/tools/love-compatibility").then((mod) => mod.LoveCompatibility)
);

export default function LoveCompatibilityPage() {
  return (
    <ToolLayout
      title="Test de Compatibilité Amoureuse"
      description="Découvrez votre taux de compatibilité avec votre crush ❤️"
    >
      <LoveCompatibility />
    </ToolLayout>
  );
}
