import { Suspense } from "react";
import { FamilyBudgetPlanner } from "@/components/living-budget-calculator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LivingBudgetPage() {
  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden">
      <header className="shrink-0 px-6 py-4 flex items-center gap-6 border-b border-neutral-200 bg-white">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            Budget familial
          </h1>
          <p className="text-sm text-neutral-500">
            Analysez vos finances et optimisez votre épargne
          </p>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-6">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-neutral-400">Chargement...</div>}>
          <FamilyBudgetPlanner />
        </Suspense>
      </main>
    </div>
  );
}
