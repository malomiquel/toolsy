import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const PasswordGenerator = dynamic(() =>
  import("@/components/tools/password-generator").then((mod) => mod.PasswordGenerator)
);

export default function PasswordGeneratorPage() {
  return (
    <ToolLayout
      title="Générateur de Mot de Passe"
      description="Créez des mots de passe sécurisés et personnalisés"
    >
      <PasswordGenerator />
    </ToolLayout>
  );
}
