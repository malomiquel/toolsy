import { ToolLayout, QrGenerator } from "@/components/tools";

export default function QrGeneratorPage() {
  return (
    <ToolLayout
      title="Générateur de QR Code"
      description="Créez des QR codes pour texte, URL, email, téléphone ou WiFi"
    >
      <QrGenerator />
    </ToolLayout>
  );
}
