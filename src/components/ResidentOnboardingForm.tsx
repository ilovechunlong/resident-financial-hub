import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResidentFormData } from '@/types/resident';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { useOnboardingSteps } from '@/hooks/useOnboardingSteps';
import { useOnboardingValidation } from '@/hooks/useOnboardingValidation';
import { OnboardingProgressHeader } from '@/components/onboarding/OnboardingProgressHeader';
import { OnboardingNavigation } from '@/components/onboarding/OnboardingNavigation';
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
  const { currentStep, completedSteps, steps, handleNext, handlePrevious, handleStepClick } = useOnboardingSteps();
  const { validateStep } = useOnboardingValidation();
  
  const [formData, setFormData] = useState<ResidentFormData & { 
    social_security_number?: string;
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
    mobility_level: 'independent',
    care_level: 'independent',
    admission_date: new Date().toISOString().split('T')[0],
    room_number: '',
    notes: '',
    status: 'active',
    income_types: [],
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isCurrentStepValid = validateStep(currentStep, formData);

  const handleNextStep = () => {
    handleNext((stepIndex) => validateStep(stepIndex, formData));
  };

  const handleStepNavigation = (stepIndex: number) => {
    handleStepClick(stepIndex, (stepIndex) => validateStep(stepIndex, formData));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep, formData)) {
      const { social_security_number, ...submitData } = formData;
      
      // Add SSN to notes if provided, since we don't have a separate field in the database
      const finalData = {
        ...submitData,
        notes: `${submitData.notes ? submitData.notes + '\n\n' : ''}${social_security_number ? `SSN: ${social_security_number}` : ''}`
      };
      onSubmit(finalData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <EmergencyContactStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <AssignmentStep formData={formData} updateFormData={updateFormData} nursingHomes={nursingHomes} />;
      case 3:
        return <FinancialProfileStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <ReviewStep formData={formData} nursingHomes={nursingHomes} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <OnboardingProgressHeader
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepNavigation}
        validateStep={(stepIndex) => validateStep(stepIndex, formData)}
      />

      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      <OnboardingNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        isCurrentStepValid={isCurrentStepValid}
        onPrevious={handlePrevious}
        onNext={handleNextStep}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
