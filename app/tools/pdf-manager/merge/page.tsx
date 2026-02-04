import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const PdfMerger = dynamic(() =>
  import("@/components/tools/pdf-manager/merge").then((mod) => mod.PdfMerger)
);

export default function MergePage() {
  return (
    <ToolLayout
      title="Fusionner des PDFs"
      description="Combinez plusieurs fichiers PDF en un seul document"
      backHref="/tools/pdf-manager"
    >
      <PdfMerger />
    </ToolLayout>
  );
}
