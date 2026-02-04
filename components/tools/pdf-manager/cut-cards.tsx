"use client";

import { useState, useCallback, useMemo } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import { useDropzone } from "react-dropzone";
import Cropper, { Area } from "react-easy-crop";
import { PDFDocument, rgb } from "pdf-lib";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  Download,
  FileImage,
  Loader2,
  Crop,
  X,
  Check,
  RotateCw,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types de cartes disponibles
const CARD_SIZES = [
  {
    id: "a6",
    name: "A6 (105 × 148 mm)",
    width: 105,
    height: 148,
    perPage: 4,
    layout: "2×2",
    description: "Format A6 classique, 4 cartes par page A4",
  },
  {
    id: "a7",
    name: "A7 (105 × 74 mm)",
    width: 105, // Orientation paysage pour avoir 8 cartes
    height: 74,
    perPage: 8,
    layout: "2×4",
    description: "Petites cartes, 8 par page A4",
  },
  {
    id: "business-card",
    name: "Carte de visite (85 × 55 mm)",
    width: 85,
    height: 55,
    perPage: 10,
    layout: "2×5",
    description: "Format carte de visite standard, 10 par page A4",
  },
  {
    id: "square-small",
    name: "Carré 90×90 mm",
    width: 90,
    height: 90,
    perPage: 6,
    layout: "2×3",
    description: "Format carré, 6 par page A4",
  },
] as const;

// Format A4 en points (1mm = 2.83465 points)
const A4_WIDTH_PT = 595.28; // 210mm
const A4_HEIGHT_PT = 841.89; // 297mm
const MM_TO_PT = 2.834_65;

interface FileWithPreview extends File {
  preview?: string;
}

// Fonction pour créer une image depuis un crop
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

// Fonction pour "snapper" la rotation vers les angles importants
function snapRotation(rotation: number): number {
  const snapAngles = [0, 90, 180, 270, 360];
  const snapThreshold = 5; // Snapping à +/- 5 degrés

  for (const angle of snapAngles) {
    if (Math.abs(rotation - angle) <= snapThreshold) {
      return angle;
    }
  }

  return rotation;
}

// Fonction pour obtenir l'image croppée
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Canvas is empty");
      }
      const fileUrl = URL.createObjectURL(blob);
      resolve(fileUrl);
    }, "image/jpeg");
  });
}

export function CutCardsManager() {
  const [params, setParams] = useQueryStates(
    {
      cardSize: parseAsString.withDefault("a6"),
    },
    { history: "replace" },
  );

  const [uploadedFile, setUploadedFile] = useState<FileWithPreview | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  // États pour le recadrage
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Gestion du drag & drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    setUploadedFile(fileWithPreview);
    setCroppedImageUrl(null); // Reset l'image croppée
    setRotation(0); // Reset la rotation

    // Lire le fichier pour l'aperçu
    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);
      // Pour les images, ouvrir automatiquement le cropper
      if (file.type.startsWith("image/")) {
        setShowCropper(true);
      }
    });
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
  });

  // Taille de carte sélectionnée
  const selectedCardSize = useMemo(
    () =>
      CARD_SIZES.find((size) => size.id === params.cardSize) || CARD_SIZES[0],
    [params.cardSize],
  );

  // Calculer la disposition sur la page A4
  const calculateLayout = (cardWidth: number, cardHeight: number) => {
    const cardWidthPt = cardWidth * MM_TO_PT;
    const cardHeightPt = cardHeight * MM_TO_PT;

    // Calculer combien de cartes on peut mettre en largeur et hauteur
    const cols = Math.floor(A4_WIDTH_PT / cardWidthPt);
    const rows = Math.floor(A4_HEIGHT_PT / cardHeightPt);

    // Marges pour centrer
    const marginX = (A4_WIDTH_PT - cols * cardWidthPt) / 2;
    const marginY = (A4_HEIGHT_PT - rows * cardHeightPt) / 2;

    return { cols, rows, cardWidthPt, cardHeightPt, marginX, marginY };
  };

  // Calculer la disposition pour l'aperçu
  const previewLayout = useMemo(() => {
    if (!imageDataUrl && !croppedImageUrl) return null;
    return calculateLayout(selectedCardSize.width, selectedCardSize.height);
  }, [imageDataUrl, croppedImageUrl, selectedCardSize]);

  // Callback quand le crop change
  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  // Appliquer le crop
  const handleApplyCrop = useCallback(async () => {
    if (!imageDataUrl || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(imageDataUrl, croppedAreaPixels);
      setCroppedImageUrl(croppedImage);
      setShowCropper(false);
      // Reset rotation après application
      setRotation(0);
    } catch (error) {
      console.error("Erreur lors du recadrage:", error);
    }
  }, [imageDataUrl, croppedAreaPixels]);

  // Annuler le crop
  const handleCancelCrop = useCallback(() => {
    setShowCropper(false);
    // Reset rotation
    setRotation(0);
    if (!croppedImageUrl) {
      // Si pas encore de crop, utiliser l'image originale
      setCroppedImageUrl(imageDataUrl);
    }
  }, [imageDataUrl, croppedImageUrl]);

  // Générer le PDF avec les cartes
  const generateCardsPdf = async () => {
    if (!uploadedFile) return;
    const finalImageUrl = croppedImageUrl || imageDataUrl;
    if (!finalImageUrl) return;

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const layout = calculateLayout(
        selectedCardSize.width,
        selectedCardSize.height,
      );

      // Charger l'image
      const response = await fetch(finalImageUrl);
      const imageBlob = await response.blob();
      const imageBytes = await imageBlob.arrayBuffer();

      // Utiliser le type du blob actuel (pas le fichier original)
      // car l'image croppée est toujours en JPEG
      const image =
        imageBlob.type === "image/png"
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);

      // Créer une page A4
      const page = pdfDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);

      // Dessiner les cartes
      for (let row = 0; row < layout.rows; row++) {
        for (let col = 0; col < layout.cols; col++) {
          const x = layout.marginX + col * layout.cardWidthPt;
          const y =
            A4_HEIGHT_PT - layout.marginY - (row + 1) * layout.cardHeightPt;

          // Dessiner l'image
          page.drawImage(image, {
            x,
            y,
            width: layout.cardWidthPt,
            height: layout.cardHeightPt,
          });

          // Dessiner les lignes de découpe (pointillés)
          const dashPattern = [3, 3]; // 3pt trait, 3pt espace
          page.drawLine({
            start: { x, y },
            end: { x: x + layout.cardWidthPt, y },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
            dashArray: dashPattern,
          });
          page.drawLine({
            start: { x: x + layout.cardWidthPt, y },
            end: { x: x + layout.cardWidthPt, y: y + layout.cardHeightPt },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
            dashArray: dashPattern,
          });
        }
      }

      // Télécharger le PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cartes-${selectedCardSize.id}-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalImageUrl = croppedImageUrl || imageDataUrl;
  const canShowCropper =
    imageDataUrl && uploadedFile?.type.startsWith("image/");

  return (
    <div className="h-full">
      {/* Modal de recadrage */}
      {showCropper && imageDataUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-900/80 backdrop-blur-sm border-b border-white/10">
            <h3 className="text-white font-medium text-sm">Recadrer</h3>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelCrop}
                className="bg-transparent text-white border-white/20 hover:bg-white/10 h-7 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                <span className="text-xs">Annuler</span>
              </Button>
              <Button size="sm" onClick={handleApplyCrop} className="h-7 px-2">
                <Check className="h-3 w-3 mr-1" />
                <span className="text-xs">Appliquer</span>
              </Button>
            </div>
          </div>

          {/* Cropper centré */}
          <div className="flex-1 relative">
            <Cropper
              image={imageDataUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={selectedCardSize.width / selectedCardSize.height}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
            />

            {/* Zoom vertical fixé à droite */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-neutral-900/30 backdrop-blur-sm flex flex-col items-center gap-2 py-3 px-2 border-l border-white/5">
              <div className="transform -rotate-90 whitespace-nowrap mb-1">
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-medium">
                  Zoom
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="bg-white/5 text-white border-white/10 hover:bg-white/10 w-7 h-7 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>

              <div className="flex-1 flex flex-col items-center justify-center py-3">
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(values) => {
                    const newZoom = Array.isArray(values) ? values[0] : values;
                    setZoom(newZoom);
                  }}
                  orientation="vertical"
                  className="h-full"
                />
              </div>

              <span className="text-[10px] text-white font-medium">
                {zoom.toFixed(1)}x
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                className="bg-white/5 text-white border-white/10 hover:bg-white/10 w-7 h-7 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Footer avec rotation tout en bas */}
          <div className="px-4 py-2 bg-neutral-900/80 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-xl mx-auto">
              {/* Rotation */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium shrink-0">
                  Rotation
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="bg-white/5 text-white border-white/10 hover:bg-white/10 h-7 w-7 p-0 shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[rotation]}
                  onValueChange={(values) => {
                    const newRotation = Array.isArray(values)
                      ? values[0]
                      : values;
                    setRotation(snapRotation(newRotation));
                  }}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="bg-white/5 text-white border-white/10 hover:bg-white/10 h-7 w-7 p-0 shrink-0"
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
                <span className="text-[10px] text-neutral-300 font-medium shrink-0 min-w-[2.5rem] text-right">
                  {rotation}°
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonne gauche : Contrôles */}
        <div className="space-y-4">
          {/* Upload du fichier */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Fichier source
              </Label>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-neutral-300 hover:border-neutral-400",
                  uploadedFile && "border-green-500 bg-green-50",
                )}
              >
                <input {...getInputProps()} />
                <Upload
                  className={cn(
                    "mx-auto h-8 w-8 mb-2",
                    uploadedFile ? "text-green-600" : "text-neutral-400",
                  )}
                />
                {uploadedFile ? (
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-green-700 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Cliquez pour remplacer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-neutral-700">
                      Glissez votre image
                    </p>
                    <p className="text-xs text-neutral-500">
                      PNG, JPG, GIF, WebP
                    </p>
                  </div>
                )}
              </div>

              {/* Bouton pour recadrer */}
              {canShowCropper && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCropper(true)}
                  className="w-full"
                >
                  <Crop className="h-4 w-4 mr-2" />
                  {croppedImageUrl ? "Modifier le recadrage" : "Recadrer"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Sélection de la taille */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Taille des cartes
              </Label>
              <Select
                value={params.cardSize}
                onValueChange={(value) => setParams({ cardSize: value })}
              >
                <SelectTrigger className="h-auto py-2">
                  <SelectValue>{selectedCardSize.name}</SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full">
                  {CARD_SIZES.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-medium text-sm">{size.name}</span>
                        <span className="text-xs text-neutral-500">
                          {size.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Informations sur la disposition */}
              <div className="pt-3 border-t space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Par page :</span>
                  <span className="font-medium">
                    {selectedCardSize.perPage} cartes
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Disposition :</span>
                  <span className="font-medium">{selectedCardSize.layout}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Format :</span>
                  <span className="font-medium">
                    {selectedCardSize.width} × {selectedCardSize.height} mm
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton de génération */}
          <Button
            onClick={generateCardsPdf}
            disabled={!uploadedFile || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Générer le PDF
              </>
            )}
          </Button>
        </div>

        {/* Colonnes droite : Aperçu */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                  Aperçu sur page A4
                </Label>
                {previewLayout && (
                  <span className="text-xs text-neutral-500">
                    {previewLayout.cols}×{previewLayout.rows} cartes
                  </span>
                )}
              </div>

              <div className="bg-neutral-100 rounded-lg p-4 flex items-center justify-center">
                {finalImageUrl && previewLayout ? (
                  <div
                    className="relative bg-white shadow-lg"
                    style={{
                      width: "100%",
                      maxWidth: "420px",
                      aspectRatio: "210 / 297",
                    }}
                  >
                    {/* Page A4 avec grille de cartes */}
                    <div
                      className="grid gap-0 w-full h-full p-2"
                      style={{
                        gridTemplateColumns: `repeat(${previewLayout.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${previewLayout.rows}, 1fr)`,
                      }}
                    >
                      {Array.from({
                        length: previewLayout.cols * previewLayout.rows,
                      }).map((_, i) => (
                        <div
                          key={i}
                          className="border border-dashed border-neutral-300 flex items-center justify-center overflow-hidden"
                        >
                          <img
                            src={finalImageUrl}
                            alt={`Carte ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Badge format */}
                    <div className="absolute top-2 right-2 bg-neutral-900/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white">
                      A4
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FileImage className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                    <p className="text-sm text-neutral-500">
                      Importez une image pour voir l&apos;aperçu
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
