import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const CutCardsManager = dynamic(() =>
  import("@/components/tools/pdf-manager/cut-cards").then(
    (mod) => mod.CutCardsManager
  )
);

export default function CutCardsPage() {
  return (
    <ToolLayout
      title="Cartes à Découper"
      description="Transformez vos images en cartes prêtes à imprimer et découper"
      backHref="/tools/pdf-manager"
    >
      <CutCardsManager />
    </ToolLayout>
  );
}
