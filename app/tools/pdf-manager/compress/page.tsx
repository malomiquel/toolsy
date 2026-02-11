import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const ImageCompressor = dynamic(() =>
  import("@/components/tools/pdf-manager/compress").then((mod) => mod.ImageCompressor),
);

export default function CompressPage() {
  return (
    <ToolLayout
      title="Compresser des Images"
      description="Réduisez la taille de vos images tout en conservant une bonne qualité"
    >
      <ImageCompressor />
    </ToolLayout>
  );
}
