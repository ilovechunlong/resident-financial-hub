
import { useState } from 'react';

export function useOnboardingSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = [
    { id: 'personal', label: 'Personal Info', icon: '1' },
    { id: 'emergency', label: 'Emergency Contact', icon: '2' },
    { id: 'assignment', label: 'Assignment', icon: '3' },
    { id: 'financial', label: 'Financial Profile', icon: '4' },
    { id: 'review', label: 'Review', icon: '5' },
  ];

  const handleNext = (validateStep: (stepIndex: number) => boolean) => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number, validateStep: (stepIndex: number) => boolean) => {
    // Allow clicking on previous steps or the next step if current is complete
    if (stepIndex <= currentStep || (stepIndex === currentStep + 1 && validateStep(currentStep))) {
      if (validateStep(currentStep)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      }
      setCurrentStep(stepIndex);
    }
  };

  return {
    currentStep,
    completedSteps,
    steps,
    handleNext,
    handlePrevious,
    handleStepClick,
  };
}
