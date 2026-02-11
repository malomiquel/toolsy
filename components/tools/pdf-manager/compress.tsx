"use client";

import { useState, useCallback } from "react";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Upload,
  FileImage,
  Loader2,
  Download,
  X,
  ImageDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OutputFormat = "original" | "jpeg" | "webp";

const FORMAT_OPTIONS: { value: OutputFormat; label: string; mime: string }[] = [
  { value: "original", label: "Format d'origine", mime: "" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg" },
  { value: "webp", label: "WebP", mime: "image/webp" },
];

interface CompressedImage {
  id: string;
  file: File;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedSize: number | null;
  previewUrl: string;
  compressedUrl: string | null;
  isProcessing: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

function getMimeType(file: File, format: OutputFormat): string {
  if (format === "original") {
    if (file.type === "image/png") return "image/png";
    if (file.type === "image/webp") return "image/webp";
    return "image/jpeg";
  }
  return FORMAT_OPTIONS.find((f) => f.value === format)!.mime;
}

function getExtension(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function ImageCompressor() {
  const [params, setParams] = useQueryStates(
    {
      quality: parseAsInteger.withDefault(70),
      format: parseAsString.withDefault("original"),
    },
    { history: "replace" },
  );

  const [images, setImages] = useState<CompressedImage[]>([]);
  const [isCompressingAll, setIsCompressingAll] = useState(false);

  const quality = params.quality;
  const format = params.format as OutputFormat;

  const compressImage = useCallback(
    async (image: CompressedImage, q: number, fmt: OutputFormat): Promise<CompressedImage> => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(image.file);
      });

      const img = await loadImage(dataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Impossible de créer le contexte 2D");

      ctx.drawImage(img, 0, 0);

      const mime = getMimeType(image.file, fmt);
      const qualityParam = mime === "image/png" ? undefined : q / 100;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Erreur lors de la compression"));
          },
          mime,
          qualityParam,
        );
      });

      const compressedUrl = URL.createObjectURL(blob);

      return {
        ...image,
        compressedBlob: blob,
        compressedSize: blob.size,
        compressedUrl,
        isProcessing: false,
      };
    },
    [],
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: CompressedImage[] = acceptedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      originalSize: file.size,
      compressedBlob: null,
      compressedSize: null,
      previewUrl: URL.createObjectURL(file),
      compressedUrl: null,
      isProcessing: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
  });

  const compressAll = async () => {
    if (images.length === 0) return;
    setIsCompressingAll(true);

    // Mark all as processing
    setImages((prev) => prev.map((img) => ({ ...img, isProcessing: true })));

    const results: CompressedImage[] = [];
    for (const image of images) {
      try {
        // Revoke old compressed URL if any
        if (image.compressedUrl) URL.revokeObjectURL(image.compressedUrl);
        const compressed = await compressImage(image, quality, format);
        results.push(compressed);
      } catch {
        results.push({ ...image, isProcessing: false });
      }
    }

    setImages(results);
    setIsCompressingAll(false);
  };

  const downloadSingle = (image: CompressedImage) => {
    if (!image.compressedBlob || !image.compressedUrl) return;

    const mime = getMimeType(image.file, format);
    const ext = getExtension(mime);
    const baseName = image.file.name.replace(/\.[^/.]+$/, "");

    const link = document.createElement("a");
    link.href = image.compressedUrl;
    link.download = `${baseName}-compressed${ext}`;
    link.click();
  };

  const downloadAll = async () => {
    const compressed = images.filter((img) => img.compressedBlob);
    if (compressed.length === 0) return;

    if (compressed.length === 1) {
      downloadSingle(compressed[0]);
      return;
    }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const image of compressed) {
      const mime = getMimeType(image.file, format);
      const ext = getExtension(mime);
      const baseName = image.file.name.replace(/\.[^/.]+$/, "");
      zip.file(`${baseName}-compressed${ext}`, image.compressedBlob!);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "images-compressees.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.previewUrl);
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const hasCompressed = images.some((img) => img.compressedBlob !== null);

  return (
    <div className="h-full">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonne gauche : Controles */}
        <div className="space-y-4">
          {/* Upload */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Images source
              </Label>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-neutral-300 hover:border-neutral-400",
                  images.length > 0 && "border-green-500 bg-green-50",
                )}
              >
                <input {...getInputProps()} />
                <Upload
                  className={cn(
                    "mx-auto h-8 w-8 mb-2",
                    images.length > 0 ? "text-green-600" : "text-neutral-400",
                  )}
                />
                {images.length > 0 ? (
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-green-700">
                      {images.length} image{images.length > 1 ? "s" : ""} ajoutee{images.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Cliquez pour en ajouter d&apos;autres
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-neutral-700">
                      Glissez vos images
                    </p>
                    <p className="text-xs text-neutral-500">PNG, JPG, WebP</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Qualite */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                  Qualite
                </Label>
                <span className="text-sm font-semibold text-neutral-900">
                  {quality}%
                </span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  setParams({ quality: v });
                }}
                min={1}
                max={100}
                step={1}
              />
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Petite taille</span>
                <span>Haute qualite</span>
              </div>
            </CardContent>
          </Card>

          {/* Format de sortie */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 space-y-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Format de sortie
              </Label>
              <Select
                value={format}
                onValueChange={(value) => {
                  setParams({ format: value });
                }}
              >
                <SelectTrigger className="h-auto py-2">
                  <SelectValue>
                    {FORMAT_OPTIONS.find((o) => o.value === format)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="font-medium text-sm">{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <Button
            onClick={compressAll}
            disabled={images.length === 0 || isCompressingAll}
            className="w-full"
            size="lg"
          >
            {isCompressingAll ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Compression...
              </>
            ) : (
              <>
                <ImageDown className="mr-2 h-5 w-5" />
                Compresser {images.length > 0 ? `(${images.length})` : ""}
              </>
            )}
          </Button>

          {hasCompressed && (
            <Button
              onClick={downloadAll}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Tout telecharger{images.filter((i) => i.compressedBlob).length > 1 ? " (ZIP)" : ""}
            </Button>
          )}
        </div>

        {/* Colonne droite : Liste des images */}
        <div className="lg:col-span-2 space-y-4">
          {images.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="bg-neutral-100 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                  <div className="text-center py-10">
                    <FileImage className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                    <p className="text-sm text-neutral-500">
                      Importez des images pour commencer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {images.map((image) => (
                <Card key={image.id} className="border-0 shadow-sm bg-white overflow-hidden">
                  <CardContent className="p-0">
                    {/* Preview */}
                    <div className="relative bg-neutral-100 aspect-video flex items-center justify-center">
                      <img
                        src={image.previewUrl}
                        alt={image.file.name}
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {image.isProcessing && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {image.file.name}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500">
                          Avant : {formatSize(image.originalSize)}
                        </span>
                        {image.compressedSize !== null && (
                          <span
                            className={cn(
                              "font-semibold",
                              image.compressedSize < image.originalSize
                                ? "text-green-600"
                                : "text-orange-500",
                            )}
                          >
                            Apres : {formatSize(image.compressedSize)}
                          </span>
                        )}
                      </div>

                      {/* Reduction percentage */}
                      {image.compressedSize !== null && (
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={cn(
                              "font-medium",
                              image.compressedSize < image.originalSize
                                ? "text-green-600"
                                : "text-orange-500",
                            )}
                          >
                            {image.compressedSize < image.originalSize
                              ? `-${Math.round((1 - image.compressedSize / image.originalSize) * 100)}%`
                              : `+${Math.round((image.compressedSize / image.originalSize - 1) * 100)}%`}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadSingle(image)}
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Telecharger
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
