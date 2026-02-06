"use client";

import { useState, useCallback } from "react";
import { useQueryStates, parseAsInteger } from "nuqs";
import { useDropzone } from "react-dropzone";
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
import {
  Upload,
  Download,
  FileImage,
  Loader2,
  ZoomIn,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SCALE_OPTIONS = [
  { value: 2, label: "2x", description: "Double la résolution" },
  { value: 3, label: "3x", description: "Triple la résolution" },
  { value: 4, label: "4x", description: "Quadruple la résolution" },
] as const;

interface FileWithPreview extends File {
  preview?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

export function UpscaleManager() {
  const [params, setParams] = useQueryStates(
    {
      scale: parseAsInteger.withDefault(2),
    },
    { history: "replace" },
  );

  const [uploadedFile, setUploadedFile] = useState<FileWithPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null);

  // Charger l'image et obtenir ses dimensions
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Gestion du drag & drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    });

    setUploadedFile(fileWithPreview);
    setUpscaledImageUrl(null);

    // Lire le fichier
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);

      // Obtenir les dimensions
      try {
        const img = await loadImage(dataUrl);
        setOriginalDimensions({ width: img.width, height: img.height });
      } catch (error) {
        console.error("Erreur lors du chargement de l'image:", error);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  });

  // Upscaler l'image
  const upscaleImage = async () => {
    if (!imageDataUrl || !originalDimensions) return;

    setIsProcessing(true);

    try {
      const img = await loadImage(imageDataUrl);
      const scale = params.scale;

      const newWidth = originalDimensions.width * scale;
      const newHeight = originalDimensions.height * scale;

      // Créer un canvas pour l'upscale
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Impossible de créer le contexte 2D");

      // Utiliser l'interpolation de haute qualité
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Dessiner l'image upscalée
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convertir en blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Erreur lors de la conversion"));
          },
          "image/png",
          1,
        );
      });

      const url = URL.createObjectURL(blob);
      setUpscaledImageUrl(url);
    } catch (error) {
      console.error("Erreur lors de l'upscale:", error);
      alert("Erreur lors de l'agrandissement de l'image.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Télécharger l'image upscalée
  const downloadImage = () => {
    if (!upscaledImageUrl || !uploadedFile) return;

    const link = document.createElement("a");
    link.href = upscaledImageUrl;
    const baseName = uploadedFile.name.replace(/\.[^/.]+$/, "");
    link.download = `${baseName}-${params.scale}x.png`;
    link.click();
  };

  const newDimensions = originalDimensions
    ? {
        width: originalDimensions.width * params.scale,
        height: originalDimensions.height * params.scale,
      }
    : null;

  return (
    <div className="h-full">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonne gauche : Contrôles */}
        <div className="space-y-4">
          {/* Upload du fichier */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Image source
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
                    <p className="text-xs text-neutral-500">PNG, JPG, WebP</p>
                  </div>
                )}
              </div>

              {/* Dimensions originales */}
              {originalDimensions && (
                <div className="pt-2 border-t text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Dimensions :</span>
                    <span className="font-medium">
                      {originalDimensions.width} × {originalDimensions.height} px
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facteur d'agrandissement */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Facteur d&apos;agrandissement
              </Label>
              <Select
                value={String(params.scale)}
                onValueChange={(value) => {
                  setParams({ scale: Number(value) });
                  setUpscaledImageUrl(null);
                }}
              >
                <SelectTrigger className="h-auto py-2">
                  <SelectValue>
                    {SCALE_OPTIONS.find((o) => o.value === params.scale)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SCALE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-medium text-sm">{option.label}</span>
                        <span className="text-xs text-neutral-500">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Nouvelles dimensions */}
              {newDimensions && (
                <div className="pt-3 border-t space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Nouvelles dimensions :</span>
                    <span className="font-medium text-blue-600">
                      {newDimensions.width} × {newDimensions.height} px
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Facteur :</span>
                    <span className="font-medium">{params.scale}x</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="space-y-2">
            <Button
              onClick={upscaleImage}
              disabled={!uploadedFile || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Agrandissement...
                </>
              ) : (
                <>
                  <ZoomIn className="mr-2 h-5 w-5" />
                  Agrandir l&apos;image
                </>
              )}
            </Button>

            {upscaledImageUrl && (
              <Button
                onClick={downloadImage}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Télécharger ({params.scale}x)
              </Button>
            )}
          </div>
        </div>

        {/* Colonnes droite : Aperçu */}
        <div className="lg:col-span-2 space-y-4">
          {/* Aperçu original */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                  Image originale
                </Label>
                {originalDimensions && (
                  <span className="text-xs text-neutral-500">
                    {originalDimensions.width} × {originalDimensions.height} px
                  </span>
                )}
              </div>

              <div className="bg-neutral-100 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                {imageDataUrl ? (
                  <img
                    src={imageDataUrl}
                    alt="Original"
                    className="max-w-full max-h-[300px] object-contain rounded shadow"
                  />
                ) : (
                  <div className="text-center py-10">
                    <FileImage className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                    <p className="text-sm text-neutral-500">
                      Importez une image pour commencer
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Aperçu upscalé */}
          {upscaledImageUrl && (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs text-neutral-500 uppercase tracking-wide flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    Image agrandie ({params.scale}x)
                  </Label>
                  {newDimensions && (
                    <span className="text-xs text-blue-600 font-medium">
                      {newDimensions.width} × {newDimensions.height} px
                    </span>
                  )}
                </div>

                <div className="bg-neutral-100 rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={upscaledImageUrl}
                    alt="Upscalé"
                    className="max-w-full max-h-[400px] object-contain rounded shadow"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
