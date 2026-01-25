import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const SizeConverter = dynamic(() =>
  import("@/components/tools/size-converter").then((mod) => mod.SizeConverter)
);

export default function SizeConverterPage() {
  return (
    <ToolLayout
      title="Convertisseur de Tailles"
      description="Vêtements et chaussures EU ⇄ UK ⇄ US"
    >
      <SizeConverter />
    </ToolLayout>
  );
}
