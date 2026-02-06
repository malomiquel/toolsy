"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Monitor } from "lucide-react";

const MIN_WIDTH = 1024; // lg breakpoint

export function DesktopOnly({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= MIN_WIDTH);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Loading state - avoid flash
  if (isDesktop === null) {
    return null;
  }

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <Monitor className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          Version mobile en cours
        </h1>
        <p className="text-neutral-500 max-w-sm">
          La version mobile de Toolsy est en cours de développement. En attendant, veuillez utiliser un ordinateur.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
