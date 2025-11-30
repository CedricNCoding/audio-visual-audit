import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext?: boolean;
}

export const StepNavigation = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrevious, 
  canGoNext = true
}: StepNavigationProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 p-4' : 'justify-between items-center pt-6 border-t border-border'} gap-2`}>
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="neon-border-yellow"
        size={isMobile ? "sm" : "default"}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {!isMobile && "Précédent"}
      </Button>
      
      {!isMobile && (
        <div className="text-sm text-muted-foreground">
          Étape {currentStep} sur {totalSteps}
        </div>
      )}
      
      <Button
        onClick={onNext}
        disabled={currentStep === totalSteps || !canGoNext}
        className="bg-secondary hover:bg-secondary/80"
        size={isMobile ? "sm" : "default"}
      >
        {currentStep === totalSteps ? "Terminer" : "Suivant"}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};
