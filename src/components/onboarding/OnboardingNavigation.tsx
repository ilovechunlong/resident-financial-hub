
import { Button } from '@/components/ui/button';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  isCurrentStepValid: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function OnboardingNavigation({
  currentStep,
  totalSteps,
  isCurrentStepValid,
  onPrevious,
  onNext,
  onCancel,
  onSubmit
}: OnboardingNavigationProps) {
  return (
    <div className="flex justify-between mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={currentStep === 0 ? onCancel : onPrevious}
      >
        {currentStep === 0 ? 'Cancel' : 'Previous'}
      </Button>

      <div className="flex gap-2">
        {currentStep < totalSteps - 1 ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={!isCurrentStepValid}
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!isCurrentStepValid}
            className="bg-green-600 hover:bg-green-700"
          >
            Complete Onboarding
          </Button>
        )}
      </div>
    </div>
  );
}
