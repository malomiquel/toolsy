import { ToolLayout, PasswordGenerator } from "@/components/tools";

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
