
import { CheckCircle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: string;
}

interface OnboardingProgressHeaderProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (stepIndex: number) => void;
  validateStep: (stepIndex: number) => boolean;
}

export function OnboardingProgressHeader({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  validateStep
}: OnboardingProgressHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Onboard New Resident</h2>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => onStepClick(index)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                completedSteps.has(index)
                  ? 'bg-green-500 border-green-500 text-white'
                  : index === currentStep
                  ? 'border-blue-500 text-blue-500 bg-blue-50'
                  : index < currentStep || validateStep(currentStep)
                  ? 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500 cursor-pointer'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
              disabled={index > currentStep && (!validateStep(currentStep) || index > currentStep + 1)}
            >
              {completedSteps.has(index) ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span className="text-sm font-medium">{step.icon}</span>
              )}
            </button>
            <div className="ml-2 hidden sm:block">
              <div className={`text-sm font-medium ${
                index === currentStep ? 'text-blue-600' : 
                completedSteps.has(index) ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.label}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-4 ${
                completedSteps.has(index) ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
