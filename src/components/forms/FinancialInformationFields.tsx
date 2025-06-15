
import React from 'react';
import { useIncomeTypeCategoryMapping } from '@/hooks/useIncomeTypeCategoryMapping';
import { formatIncomeTypes } from '@/components/onboarding/financial/IncomeTypeFormatter';
import { IncomeTypesGrid } from '@/components/onboarding/financial/IncomeTypesGrid';
import { CustomIncomeTypeForm } from '@/components/onboarding/financial/CustomIncomeTypeForm';
import { SelectedIncomeTypes } from '@/components/onboarding/financial/SelectedIncomeTypes';
import { ResidentFormData } from '@/types/resident';

interface FinancialInformationFieldsProps {
  formData: ResidentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResidentFormData>>;
}

export function FinancialInformationFields({ formData, setFormData }: FinancialInformationFieldsProps) {
  const { data: incomeTypeMappings, isLoading, error } = useIncomeTypeCategoryMapping();
  
  const incomeTypes = formatIncomeTypes(incomeTypeMappings);

  const handleIncomeTypeChange = (incomeTypeId: string, checked: boolean) => {
    const currentTypes = formData.income_types || [];
    let updatedTypes;
    
    if (checked) {
      updatedTypes = [...currentTypes, incomeTypeId];
    } else {
      updatedTypes = currentTypes.filter((type: string) => type !== incomeTypeId);
    }
    
    setFormData(prev => ({ ...prev, income_types: updatedTypes }));
  };

  const addCustomIncomeType = (customIncomeType: string) => {
    const currentTypes = formData.income_types || [];
    const customId = `custom_${customIncomeType.toLowerCase().replace(/\s+/g, '_')}`;
    
    if (!currentTypes.includes(customId)) {
      setFormData(prev => ({ ...prev, income_types: [...currentTypes, customId] }));
    }
  };

  const removeCustomIncomeType = (typeId: string) => {
    const currentTypes = formData.income_types || [];
    setFormData(prev => ({ ...prev, income_types: currentTypes.filter((type: string) => type !== typeId) }));
  };

  const getDisplayName = (typeId: string) => {
    if (!incomeTypes) return typeId.replace('custom_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const standardType = incomeTypes.find(type => type.id === typeId);
    if (standardType) return standardType.label;
    
    if (typeId.startsWith('custom_')) {
      return typeId.replace('custom_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return typeId;
  };

  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
        <p className="text-sm text-gray-600 mb-6">Loading income types...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            Error loading income types. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
      <p className="text-sm text-gray-600 mb-6">
        Select all applicable income sources for this resident.
      </p>

      <div className="space-y-6">
        <IncomeTypesGrid
          incomeTypes={incomeTypes || []}
          selectedTypes={formData.income_types || []}
          onSelectionChange={handleIncomeTypeChange}
        />

        <CustomIncomeTypeForm onAddCustomType={addCustomIncomeType} />

        <SelectedIncomeTypes
          selectedTypes={formData.income_types || []}
          getDisplayName={getDisplayName}
          onRemoveCustomType={removeCustomIncomeType}
        />
      </div>
    </div>
  );
}
