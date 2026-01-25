import { ToolLayout, SizeConverter } from "@/components/tools";

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
