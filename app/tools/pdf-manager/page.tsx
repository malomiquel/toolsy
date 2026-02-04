import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const PdfManager = dynamic(() =>
  import("@/components/tools/pdf-manager").then((mod) => mod.PdfManager)
);

export default function PdfManagerPage() {
  return (
    <ToolLayout
      title="Gestionnaire d'Images et PDF"
      description="Choisissez parmi nos outils de traitement d'images et de documents"
    >
      <PdfManager />
    </ToolLayout>
  );
}
