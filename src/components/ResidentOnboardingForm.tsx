
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { ResidentFormData } from '@/types/resident';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { PersonalInfoStep } from '@/components/onboarding/PersonalInfoStep';
import { EmergencyContactStep } from '@/components/onboarding/EmergencyContactStep';
import { AssignmentStep } from '@/components/onboarding/AssignmentStep';
import { FinancialProfileStep } from '@/components/onboarding/FinancialProfileStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';

interface ResidentOnboardingFormProps {
  onSubmit: (data: ResidentFormData) => void;
  onCancel: () => void;
  preSelectedNursingHomeId?: string;
}

export function ResidentOnboardingForm({ onSubmit, onCancel, preSelectedNursingHomeId }: ResidentOnboardingFormProps) {
  const { nursingHomes } = useNursingHomes();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState<ResidentFormData & { 
    social_security_number?: string;
    income_types?: string[];
  }>({
    nursing_home_id: preSelectedNursingHomeId || '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    phone_number: '',
    social_security_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    medical_conditions: [],
    medications: [],
    dietary_restrictions: [],
    mobility_level: 'independent',
    care_level: 'independent',
    admission_date: new Date().toISOString().split('T')[0],
    room_number: '',
    monthly_fee: 0,
    insurance_provider: '',
    insurance_policy_number: '',
    notes: '',
    status: 'active',
    income_types: [],
  });

  const steps = [
    { id: 'personal', label: 'Personal Info', icon: '1' },
    { id: 'emergency', label: 'Emergency Contact', icon: '2' },
    { id: 'assignment', label: 'Assignment', icon: '3' },
    { id: 'financial', label: 'Financial Profile', icon: '4' },
    { id: 'review', label: 'Review', icon: '5' },
  ];

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Personal Info
        return !!(formData.first_name && formData.last_name && formData.date_of_birth && formData.social_security_number);
      case 1: // Emergency Contact
        return !!(formData.emergency_contact_name && formData.emergency_contact_phone && formData.emergency_contact_relationship);
      case 2: // Assignment
        return !!formData.nursing_home_id;
      case 3: // Financial Profile
        return formData.income_types && formData.income_types.length > 0;
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
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

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on previous steps or the next step if current is complete
    if (stepIndex <= currentStep || (stepIndex === currentStep + 1 && validateStep(currentStep))) {
      if (validateStep(currentStep)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      }
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const { income_types, social_security_number, ...submitData } = formData;
      // Add the income types to notes for now, since we don't have a separate field in the database
      const finalData = {
        ...submitData,
        notes: `${submitData.notes ? submitData.notes + '\n\n' : ''}Income Types: ${income_types?.join(', ') || 'None'}\nSSN: ${social_security_number || 'Not provided'}`
      };
      onSubmit(finalData);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Onboard New Resident</h2>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(index)}
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

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <PersonalInfoStep
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 1 && (
            <EmergencyContactStep
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 2 && (
            <AssignmentStep
              formData={formData}
              updateFormData={updateFormData}
              nursingHomes={nursingHomes}
            />
          )}
          
          {currentStep === 3 && (
            <FinancialProfileStep
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 4 && (
            <ReviewStep
              formData={formData}
              nursingHomes={nursingHomes}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!validateStep(currentStep)}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
