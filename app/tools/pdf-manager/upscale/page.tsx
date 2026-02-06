import dynamic from "next/dynamic";
import { ToolLayout } from "@/components/tools/tool-layout";

const UpscaleManager = dynamic(() =>
  import("@/components/tools/pdf-manager/upscale").then((mod) => mod.UpscaleManager),
);

export default function UpscalePage() {
  return (
    <ToolLayout
      title="Agrandir une image"
      description="Augmentez la résolution de vos images (2x, 3x, 4x)"
    >
      <UpscaleManager />
    </ToolLayout>
  );
}
