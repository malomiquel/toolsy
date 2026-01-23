import { SalaryCalculator } from "@/components/salary-calculator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SalaryCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux outils
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Calculateur de Salaire Brut en Net
          </h1>
          <p className="text-lg text-muted-foreground">
            Calculez votre salaire net à partir du brut avec le prélèvement à la source
          </p>
        </div>

        <SalaryCalculator />
      </div>
    </div>
  );
}
