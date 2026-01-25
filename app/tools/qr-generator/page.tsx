import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const QrGenerator = dynamic(() =>
  import("@/components/tools/qr-generator").then((mod) => mod.QrGenerator)
);

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
