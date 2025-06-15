
interface FormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nursing_home_id: string;
  income_types?: string[];
}

export function useOnboardingValidation() {
  const validateStep = (stepIndex: number, formData: FormData): boolean => {
    switch (stepIndex) {
      case 0: // Personal Info - only first name, last name, and date of birth required
        return !!(formData.first_name && formData.last_name && formData.date_of_birth);
      case 1: // Emergency Contact - all fields are now optional
        return true;
      case 2: // Assignment - nursing home is now optional
        return true;
      case 3: // Financial Profile
        return formData.income_types && formData.income_types.length > 0;
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  return { validateStep };
}
