"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, degrees } from "pdf-lib";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Download,
  FileText,
  X,
  Loader2,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

interface PdfInfo {
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnails: string[];
}

/**
 * Calcule l'ordre d'imposition pour un livret.
 * Retourne un tableau de paires [gauche, droite] (indices 0-based).
 */
function getBookletPageOrder(pageCount: number): [number, number][] {
  const pairs: [number, number][] = [];
  const sheets = pageCount / 4;

  for (let i = 0; i < sheets; i++) {
    // Recto (front) : [dernière - 2i, première + 2i]
    pairs.push([pageCount - 1 - 2 * i, 2 * i]);
    // Verso (back) : [première + 2i + 1, dernière - 2i - 1]
    pairs.push([2 * i + 1, pageCount - 2 - 2 * i]);
  }

  return pairs;
}

async function generateThumbnail(
  file: File,
  pageIndex: number
): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageIndex + 1);

    const viewport = page.getViewport({ scale: 0.4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return "";

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Erreur génération thumbnail:", error);
    return "";
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BookletMaker() {
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = pdfInfo !== null && pdfInfo.pageCount % 4 === 0;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);
    setPdfInfo(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      // Générer les thumbnails
      const thumbnails: string[] = [];
      for (let i = 0; i < pageCount; i++) {
        const thumb = await generateThumbnail(file, i);
        thumbnails.push(thumb);
      }

      setPdfInfo({
        file,
        name: file.name,
        size: file.size,
        pageCount,
        thumbnails,
      });
    } catch (error) {
      console.error("Erreur lors de la lecture du PDF:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const removeFile = () => {
    setPdfInfo(null);
  };

  const generateBooklet = async () => {
    if (!pdfInfo || !isValid) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await pdfInfo.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const bookletPdf = await PDFDocument.create();

      const pairs = getBookletPageOrder(pdfInfo.pageCount);
      const sourcePages = sourcePdf.getPages();

      for (let pairIdx = 0; pairIdx < pairs.length; pairIdx++) {
        const [leftIdx, rightIdx] = pairs[pairIdx];
        const isVerso = pairIdx % 2 === 1;

        // Page A4 paysage
        const page = bookletPdf.addPage([A4_HEIGHT, A4_WIDTH]);

        // Les pages verso sont retournées à 180° pour l'impression recto-verso
        // (retourner sur le bord long, le réglage par défaut des imprimantes)
        if (isVerso) {
          page.setRotation(degrees(180));
        }
        const halfWidth = A4_HEIGHT / 2;
        const fullHeight = A4_WIDTH;

        // Embed les deux pages source
        const leftPage = await bookletPdf.embedPage(sourcePages[leftIdx]);
        const rightPage = await bookletPdf.embedPage(sourcePages[rightIdx]);

        // Dessiner les deux pages, chacune dans sa moitié
        const drawHalf = (
          embedded: Awaited<ReturnType<typeof bookletPdf.embedPage>>,
          offsetX: number
        ) => {
          const scale = Math.min(
            halfWidth / embedded.width,
            fullHeight / embedded.height
          );
          const drawW = embedded.width * scale;
          const drawH = embedded.height * scale;
          const x = offsetX + (halfWidth - drawW) / 2;
          const y = (fullHeight - drawH) / 2;
          page.drawPage(embedded, { x, y, width: drawW, height: drawH });
        };

        drawHalf(leftPage, 0);
        drawHalf(rightPage, halfWidth);
      }

      const pdfBytes = await bookletPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `livret-${pdfInfo.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de la génération du livret:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pairs = pdfInfo && isValid ? getBookletPageOrder(pdfInfo.pageCount) : [];

  return (
    <div className="h-full">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonne gauche : Upload et contrôles */}
        <div className="flex flex-col gap-3">
          {/* Zone d'upload */}
          <Card className="border-0 shadow-sm bg-white flex-shrink-0">
            <CardContent className="p-3 space-y-2">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Fichier PDF
              </Label>

              {!pdfInfo ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors",
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-neutral-300 hover:border-neutral-400"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-6 w-6 mb-1 text-neutral-400" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-neutral-700">
                      {isDragActive
                        ? "Déposez le fichier ici"
                        : "Glissez votre PDF"}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      ou cliquez pour sélectionner
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-neutral-200 p-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-900 truncate">
                        {pdfInfo.name}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        {formatFileSize(pdfInfo.size)} • {pdfInfo.pageCount}{" "}
                        page{pdfInfo.pageCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="flex-shrink-0 h-6 w-6 p-0 text-neutral-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message d'erreur si pages non divisibles par 4 */}
          {pdfInfo && pdfInfo.pageCount % 4 !== 0 && (
            <Card className="border-0 shadow-sm bg-white flex-shrink-0">
              <CardContent className="p-3">
                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <p className="font-medium mb-0.5">
                      Nombre de pages incompatible
                    </p>
                    <p className="text-amber-700 leading-relaxed">
                      Le PDF contient {pdfInfo.pageCount} page
                      {pdfInfo.pageCount > 1 ? "s" : ""}. Pour créer un livret,
                      le nombre de pages doit être divisible par 4 (ex : 4, 8,
                      12, 16...).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résumé */}
          {pdfInfo && isValid && (
            <Card className="border-0 shadow-sm bg-white flex-shrink-0">
              <CardContent className="p-3 space-y-2">
                <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                  Résumé
                </Label>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Pages source :</span>
                    <span className="font-medium">{pdfInfo.pageCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Feuilles à imprimer :</span>
                    <span className="font-medium">
                      {pdfInfo.pageCount / 4}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Pages du PDF final :</span>
                    <span className="font-medium">
                      {pdfInfo.pageCount / 2}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bouton de génération */}
          <Button
            onClick={generateBooklet}
            disabled={!isValid || isProcessing}
            className="w-full flex-shrink-0"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Générer le livret
              </>
            )}
          </Button>
        </div>

        {/* Colonne droite : Aperçu de l'imposition */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-3">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide mb-3 block">
                Aperçu de l&apos;imposition
              </Label>

              {isLoading && (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-xs text-neutral-500">
                    Chargement du PDF...
                  </p>
                </div>
              )}

              {!isLoading && !pdfInfo && (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-10 w-10 text-neutral-300 mb-2" />
                  <p className="text-xs text-neutral-500 mb-1">
                    Aucun fichier ajouté
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Glissez un PDF dans la zone d&apos;upload pour voir
                    l&apos;aperçu
                  </p>
                </div>
              )}

              {!isLoading && pdfInfo && !isValid && (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto h-10 w-10 text-amber-300 mb-2" />
                  <p className="text-xs text-neutral-500">
                    Le nombre de pages doit être divisible par 4
                  </p>
                </div>
              )}

              {!isLoading && pdfInfo && isValid && (
                <ScrollArea className="h-[450px]">
                  <div className="space-y-3 pr-3 pb-3">
                    {pairs.map(([leftIdx, rightIdx], sheetIdx) => (
                      <div key={sheetIdx}>
                        {/* Label feuille */}
                        <p className="text-[10px] text-neutral-500 mb-1">
                          {sheetIdx % 2 === 0
                            ? `Feuille ${Math.floor(sheetIdx / 2) + 1} — Recto`
                            : `Feuille ${Math.floor(sheetIdx / 2) + 1} — Verso`}
                        </p>

                        {/* Deux pages côte à côte dans un cadre paysage */}
                        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                          <div className="flex aspect-[1.414/1]">
                            {/* Page gauche */}
                            <div className="relative flex-1 border-r border-dashed border-neutral-300 flex items-center justify-center p-1">
                              {pdfInfo.thumbnails[leftIdx] ? (
                                <img
                                  src={pdfInfo.thumbnails[leftIdx]}
                                  alt={`Page ${leftIdx + 1}`}
                                  className="max-w-full max-h-full object-contain"
                                  draggable={false}
                                />
                              ) : (
                                <FileText className="h-6 w-6 text-neutral-300" />
                              )}
                              <span className="absolute text-[9px] font-medium text-neutral-400 bottom-1 left-2">
                                p.{leftIdx + 1}
                              </span>
                            </div>

                            {/* Page droite */}
                            <div className="relative flex-1 flex items-center justify-center p-1">
                              {pdfInfo.thumbnails[rightIdx] ? (
                                <img
                                  src={pdfInfo.thumbnails[rightIdx]}
                                  alt={`Page ${rightIdx + 1}`}
                                  className="max-w-full max-h-full object-contain"
                                  draggable={false}
                                />
                              ) : (
                                <FileText className="h-6 w-6 text-neutral-300" />
                              )}
                              <span className="absolute text-[9px] font-medium text-neutral-400 bottom-1 right-2">
                                p.{rightIdx + 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Info */}
              {pdfInfo && isValid && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-3 w-3 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900">
                      <p className="font-medium mb-0.5">
                        Comment imprimer votre livret
                      </p>
                      <p className="text-blue-700 leading-relaxed">
                        • Imprimez le PDF en recto-verso (retourner sur le bord
                        court)
                        <br />• Pliez toutes les feuilles ensemble au milieu
                        <br />• Agrafez au centre pour former le carnet
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
