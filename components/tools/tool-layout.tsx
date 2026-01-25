import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

// Server Component - no "use client" needed
export function ToolLayout({ title, description, children }: ToolLayoutProps) {
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
          <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-6">
        <Suspense
          fallback={
            <div className="h-full flex items-center justify-center text-neutral-400">
              Chargement...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
