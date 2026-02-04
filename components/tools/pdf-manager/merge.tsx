"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
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
  FilePlus,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function ScrollAreaWithShadows({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current?.querySelector(
      "[data-slot='scroll-area-viewport']",
    );
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      setShowTopShadow(scrollTop > 0);
      setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 1);
    };

    // Initial check
    handleScroll();

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [children]);

  return (
    <div ref={scrollRef} className="relative">
      {/* Gradient top */}
      {showTopShadow && (
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      )}
      {/* Gradient bottom */}
      {showBottomShadow && (
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      )}
      <ScrollArea className={className}>{children}</ScrollArea>
    </div>
  );
}

interface PdfPage {
  id: string;
  pageNumber: number;
  selected: boolean;
  thumbnail: string;
  pdfFileId: string;
}

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: PdfPage[];
}

// Composant pour une page draggable
function SortablePage({
  page,
  onToggleSelect,
}: {
  page: PdfPage;
  onToggleSelect: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Séparer les listeners pour éviter le conflit avec la checkbox
  const dragListeners = {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      // Ne pas démarrer le drag si on clique sur la checkbox
      const target = e.target as HTMLElement;
      if (target.closest("[data-checkbox]")) {
        return;
      }
      listeners?.onPointerDown?.(e);
    },
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...dragListeners}
      className={cn(
        "relative group cursor-move",
        isDragging && "opacity-50 z-50",
      )}
    >
      <div
        className={cn(
          "border-2 rounded-lg overflow-hidden transition-all",
          page.selected
            ? "border-blue-500 bg-blue-50"
            : "border-neutral-200 bg-white opacity-60",
        )}
      >
        {/* Checkbox */}
        <div className="absolute top-2 left-2 z-10" data-checkbox>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(page.id);
            }}
            className="bg-white rounded shadow-sm p-1 hover:bg-neutral-50 transition-colors touch-none"
          >
            {page.selected ? (
              <CheckSquare className="h-4 w-4 text-blue-600 pointer-events-none" />
            ) : (
              <Square className="h-4 w-4 text-neutral-400 pointer-events-none" />
            )}
          </button>
        </div>

        {/* Numéro de page */}
        <div className="absolute top-2 right-2 z-10 bg-white rounded shadow-sm px-2 py-0.5">
          <span className="text-xs font-medium text-neutral-700">
            {page.pageNumber}
          </span>
        </div>

        {/* Thumbnail */}
        <div className="aspect-[1/1.414] bg-neutral-100">
          {page.thumbnail ? (
            <img
              src={page.thumbnail}
              alt={`Page ${page.pageNumber}`}
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-neutral-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PdfMerger() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [allPages, setAllPages] = useState<PdfPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Générer une miniature pour une page PDF
  const generateThumbnail = async (
    file: File,
    pageIndex: number,
  ): Promise<string> => {
    try {
      // Importer pdfjs uniquement côté client
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

      // Configurer le worker avec unpkg CDN (plus fiable)
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.mjs`;

      // Lire le fichier à chaque fois pour éviter le problème de ArrayBuffer détaché
      const arrayBuffer = await file.arrayBuffer();

      // Charger le PDF avec pdfjs
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Obtenir la page
      const page = await pdf.getPage(pageIndex + 1); // pdfjs utilise 1-indexing

      // Calculer la taille de la miniature
      const viewport = page.getViewport({ scale: 0.5 });

      // Créer un canvas
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return "";

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Rendre la page sur le canvas
      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise;

      // Convertir le canvas en data URL
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Erreur génération thumbnail:", error);
      return "";
    }
  };

  // Gestion du drag & drop pour l'upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoadingThumbnails(true);
    const newPdfFiles: PdfFile[] = [];
    const newPages: PdfPage[] = [];

    for (const file of acceptedFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        const fileId = Math.random().toString(36).slice(7);
        const pages: PdfPage[] = [];

        // Créer les objets page avec miniatures
        for (let i = 0; i < pageCount; i++) {
          const pageId = `${fileId}-page-${i}`;
          const thumbnail = await generateThumbnail(file, i);

          const page: PdfPage = {
            id: pageId,
            pageNumber: i + 1,
            selected: true, // Par défaut, toutes les pages sont sélectionnées
            thumbnail,
            pdfFileId: fileId,
          };

          pages.push(page);
          newPages.push(page);
        }

        newPdfFiles.push({
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          pages,
        });
      } catch (error) {
        console.error("Erreur lors de la lecture du PDF:", error);
      }
    }

    setPdfFiles((prev) => [...prev, ...newPdfFiles]);
    setAllPages((prev) => [...prev, ...newPages]);
    setIsLoadingThumbnails(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  // Supprimer un fichier
  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((file) => file.id !== id));
    setAllPages((prev) => prev.filter((page) => page.pdfFileId !== id));
  };

  // Toggle sélection d'une page
  const togglePageSelection = (pageId: string) => {
    setAllPages((prev) =>
      prev.map((page) =>
        page.id === pageId ? { ...page, selected: !page.selected } : page,
      ),
    );
  };

  // Sélectionner/désélectionner toutes les pages d'un fichier
  const toggleFileSelection = (fileId: string, selected: boolean) => {
    setAllPages((prev) =>
      prev.map((page) =>
        page.pdfFileId === fileId ? { ...page, selected } : page,
      ),
    );
  };

  // Gestion du drag & drop pour réorganiser les pages
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAllPages((pages) => {
        const oldIndex = pages.findIndex((p) => p.id === active.id);
        const newIndex = pages.findIndex((p) => p.id === over.id);

        return arrayMove(pages, oldIndex, newIndex);
      });
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Calculer le nombre total de pages sélectionnées
  const selectedPagesCount = useMemo(() => {
    return allPages.filter((page) => page.selected).length;
  }, [allPages]);

  // Fusionner les PDFs
  const mergePdfs = async () => {
    if (selectedPagesCount === 0) return;

    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      // Regrouper les pages par fichier pour optimiser le chargement
      const pagesByFile = new Map<string, number[]>();

      for (const page of allPages) {
        if (!page.selected) continue;

        if (!pagesByFile.has(page.pdfFileId)) {
          pagesByFile.set(page.pdfFileId, []);
        }
        pagesByFile.get(page.pdfFileId)!.push(page.pageNumber - 1);
      }

      // Copier les pages dans l'ordre
      for (const page of allPages) {
        if (!page.selected) continue;

        const pdfFile = pdfFiles.find((f) => f.id === page.pdfFileId);
        if (!pdfFile) continue;

        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        const [copiedPage] = await mergedPdf.copyPages(pdf, [
          page.pageNumber - 1,
        ]);
        mergedPdf.addPage(copiedPage);
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fusion-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de la fusion:", error);
      alert("Erreur lors de la fusion des PDFs. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Colonne gauche : Upload et contrôles */}
        <div className="flex flex-col gap-3">
          {/* Zone d'upload */}
          <Card className="border-0 shadow-sm bg-white flex-shrink-0">
            <CardContent className="p-3 space-y-2">
              <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                Ajouter des PDFs
              </Label>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-neutral-300 hover:border-neutral-400",
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-6 w-6 mb-1 text-neutral-400" />
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-neutral-700">
                    {isDragActive
                      ? "Déposez les fichiers ici"
                      : "Glissez vos PDFs"}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    ou cliquez pour sélectionner
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des fichiers sources avec scroll */}
          {pdfFiles.length > 0 && (
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-3">
                <Label className="text-xs text-neutral-500 uppercase tracking-wide mb-2 block">
                  Fichiers sources
                </Label>
                <ScrollAreaWithShadows className="h-[180px]">
                  <div className="space-y-2 pr-3">
                    {pdfFiles.map((pdfFile) => {
                      const filePages = allPages.filter(
                        (p) => p.pdfFileId === pdfFile.id,
                      );
                      const selectedCount = filePages.filter(
                        (p) => p.selected,
                      ).length;
                      const allSelected = selectedCount === filePages.length;

                      return (
                        <div
                          key={pdfFile.id}
                          className="rounded-lg border border-neutral-200 p-2"
                        >
                          <div className="flex items-start gap-2">
                            {/* Icône PDF */}
                            <div className="flex-shrink-0 h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-red-600" />
                            </div>

                            {/* Info fichier */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-neutral-900 truncate">
                                {pdfFile.name}
                              </p>
                              <p className="text-[10px] text-neutral-500">
                                {formatFileSize(pdfFile.size)} •{" "}
                                {filePages.length} page
                                {filePages.length > 1 ? "s" : ""}
                              </p>
                              <p className="text-[10px] text-blue-600 mt-0.5">
                                {selectedCount} / {filePages.length}{" "}
                                sélectionnée
                                {selectedCount > 1 ? "s" : ""}
                              </p>
                            </div>

                            {/* Bouton supprimer */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(pdfFile.id)}
                              className="flex-shrink-0 h-6 w-6 p-0 text-neutral-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Actions rapides */}
                          <div className="mt-2 flex gap-1">
                            <button
                              onClick={() =>
                                toggleFileSelection(pdfFile.id, true)
                              }
                              disabled={allSelected}
                              className="flex-1 px-1.5 py-1 text-[10px] font-medium rounded transition-colors bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Tout
                            </button>
                            <button
                              onClick={() =>
                                toggleFileSelection(pdfFile.id, false)
                              }
                              disabled={selectedCount === 0}
                              className="flex-1 px-1.5 py-1 text-[10px] font-medium rounded transition-colors bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Aucune
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollAreaWithShadows>
              </CardContent>
            </Card>
          )}

          {/* Statistiques */}
          {allPages.length > 0 && (
            <Card className="border-0 shadow-sm bg-white flex-shrink-0">
              <CardContent className="p-3 space-y-2">
                <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                  Résumé
                </Label>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Fichiers :</span>
                    <span className="font-medium">{pdfFiles.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Pages totales :</span>
                    <span className="font-medium">{allPages.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">
                      Pages sélectionnées :
                    </span>
                    <span className="font-medium text-blue-600">
                      {selectedPagesCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-500">Taille totale :</span>
                    <span className="font-medium">
                      {formatFileSize(
                        pdfFiles.reduce((sum, f) => sum + f.size, 0),
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bouton de fusion */}
          <Button
            onClick={mergePdfs}
            disabled={selectedPagesCount === 0 || isProcessing}
            className="w-full flex-shrink-0"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fusion en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Fusionner {selectedPagesCount} page
                {selectedPagesCount > 1 ? "s" : ""}
              </>
            )}
          </Button>

          {selectedPagesCount === 0 && allPages.length > 0 && (
            <p className="text-[10px] text-center text-amber-600 flex-shrink-0">
              Sélectionnez au moins une page
            </p>
          )}
        </div>

        {/* Colonne droite : Grille de pages */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs text-neutral-500 uppercase tracking-wide">
                  Pages du document final
                </Label>
                {allPages.length > 0 && (
                  <span className="text-[10px] text-neutral-500">
                    Glissez pour réorganiser • Cliquez pour sélectionner
                  </span>
                )}
              </div>

              {isLoadingThumbnails && (
                <div className="text-center py-12">
                  <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-xs text-neutral-500">
                    Chargement des pages...
                  </p>
                </div>
              )}

              {!isLoadingThumbnails && allPages.length === 0 && (
                <div className="text-center py-12">
                  <FilePlus className="mx-auto h-10 w-10 text-neutral-300 mb-2" />
                  <p className="text-xs text-neutral-500 mb-1">
                    Aucun fichier ajouté
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Glissez vos PDFs dans la zone d&apos;upload
                  </p>
                </div>
              )}

              {!isLoadingThumbnails && allPages.length > 0 && (
                <ScrollAreaWithShadows className="h-[450px]">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={allPages.map((p) => p.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-4 gap-3 pr-3 pb-3">
                        {allPages.map((page) => (
                          <SortablePage
                            key={page.id}
                            page={page}
                            onToggleSelect={togglePageSelection}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </ScrollAreaWithShadows>
              )}

              {/* Info */}
              {allPages.length > 0 && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <FilePlus className="h-3 w-3 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900">
                      <p className="font-medium mb-0.5">
                        Personnalisez votre document
                      </p>
                      <p className="text-blue-700 leading-relaxed">
                        • Glissez-déposez pour réorganiser
                        <br />• Cliquez sur les cases pour
                        sélectionner/désélectionner
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
