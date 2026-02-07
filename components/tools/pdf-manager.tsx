"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, FilePlus, FileImage, ArrowRight, ZoomIn, BookOpen } from "lucide-react";

const FEATURES = [
  {
    id: "cut-cards",
    title: "Cartes à Découper",
    description:
      "Transformez vos images en cartes prêtes à imprimer et découper. Parfait pour les invitations, étiquettes et événements.",
    icon: Scissors,
    href: "/tools/pdf-manager/cut-cards",
    available: true,
  },
  {
    id: "merge",
    title: "Fusionner des PDFs",
    description:
      "Combinez plusieurs fichiers PDF en un seul document. Idéal pour organiser vos documents.",
    icon: FilePlus,
    href: "/tools/pdf-manager/merge",
    available: true,
  },
  {
    id: "upscale",
    title: "Agrandir une Image",
    description:
      "Augmentez la résolution de vos images (2x, 3x, 4x). Idéal pour améliorer la qualité d'impression.",
    icon: ZoomIn,
    href: "/tools/pdf-manager/upscale",
    available: true,
  },
  {
    id: "booklet",
    title: "Livret / Carnet",
    description:
      "Réorganisez les pages d'un PDF pour l'imprimer en recto-verso et le plier en livret.",
    icon: BookOpen,
    href: "/tools/pdf-manager/booklet",
    available: true,
  },
  {
    id: "compress",
    title: "Compresser des Images",
    description:
      "Réduisez la taille de vos images tout en conservant une bonne qualité. Optimisez pour le web.",
    icon: FileImage,
    href: "/tools/pdf-manager/compress",
    available: false,
  },
] as const;

export function PdfManager() {
  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Choisissez une fonctionnalité
        </h2>
        <p className="text-neutral-600">
          Sélectionnez l&apos;outil dont vous avez besoin pour gérer vos images
          et documents
        </p>
      </div>

      {/* Grid de cartes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;

          if (!feature.available) {
            return (
              <Card
                key={feature.id}
                className="border-0 shadow-sm bg-white opacity-60 cursor-not-allowed"
              >
                <CardContent className="p-6">
                  <div
                    className={`h-12 w-12 rounded-lg bg-gray-400 flex items-center justify-center mb-4`}
                  >
                    <Icon className={`h-6 w-6`} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="h-2 w-2 rounded-full bg-neutral-400" />
                    Bientôt disponible
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Link key={feature.id} href={feature.href} className="group">
              <Card className="border-0 shadow-sm bg-white h-full transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div
                    className={`h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`h-6 w-6`} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium group-hover:gap-3 transition-all">
                    Commencer
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-neutral-500">
          D&apos;autres fonctionnalités seront ajoutées prochainement
        </p>
      </div>
    </div>
  );
}
