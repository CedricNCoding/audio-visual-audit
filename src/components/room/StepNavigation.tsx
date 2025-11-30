import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext?: boolean;
}

export const StepNavigation = ({ currentStep, totalSteps, onNext, onPrevious, canGoNext = true }: StepNavigationProps) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-border">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="neon-border-yellow"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Précédent
      </Button>
      
      <div className="text-sm text-muted-foreground">
        Étape {currentStep} sur {totalSteps}
      </div>
      
      <Button
        onClick={onNext}
        disabled={currentStep === totalSteps || !canGoNext}
        className="bg-secondary hover:bg-secondary/80"
      >
        {currentStep === totalSteps ? "Terminer" : "Suivant"}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};
