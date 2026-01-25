import { ToolLayout, ColorConverter } from "@/components/tools";

export const metadata = {
  title: "Convertisseur de couleurs - Toolsy",
  description: "Convertissez facilement vos couleurs entre HEX, RGB et HSL",
};

export default function ColorConverterPage() {
  return (
    <ToolLayout
      title="Convertisseur de couleurs"
      description="Convertissez entre HEX, RGB et HSL"
    >
      <ColorConverter />
    </ToolLayout>
  );
}
