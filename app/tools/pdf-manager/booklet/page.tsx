import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const BookletMaker = dynamic(() =>
  import("@/components/tools/pdf-manager/booklet").then(
    (mod) => mod.BookletMaker
  )
);

export default function BookletPage() {
  return (
    <ToolLayout
      title="Livret / Carnet"
      description="Réorganisez les pages d'un PDF pour l'imprimer en recto-verso et le plier en livret"
      backHref="/tools/pdf-manager"
    >
      <BookletMaker />
    </ToolLayout>
  );
}
