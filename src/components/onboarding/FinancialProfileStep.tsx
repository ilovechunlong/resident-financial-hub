
import { useIncomeTypeCategoryMapping } from '@/hooks/useIncomeTypeCategoryMapping';
import { formatIncomeTypes } from './financial/IncomeTypeFormatter';
import { IncomeTypesGrid } from './financial/IncomeTypesGrid';
import { CustomIncomeTypeForm } from './financial/CustomIncomeTypeForm';
import { SelectedIncomeTypes } from './financial/SelectedIncomeTypes';

interface FinancialProfileStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function FinancialProfileStep({ formData, updateFormData }: FinancialProfileStepProps) {
  const { data: incomeTypeMappings = [], isLoading, error } = useIncomeTypeCategoryMapping();

  console.log('Income type mappings from database:', incomeTypeMappings);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

  // Extract unique income types from the mappings and format them
  const incomeTypes = formatIncomeTypes(incomeTypeMappings);
  
  console.log('Formatted income types:', incomeTypes);

  const handleIncomeTypeChange = (incomeTypeId: string, checked: boolean) => {
    const currentTypes = formData.income_types || [];
    let updatedTypes;
    
    if (checked) {
      updatedTypes = [...currentTypes, incomeTypeId];
    } else {
      updatedTypes = currentTypes.filter((type: string) => type !== incomeTypeId);
    }
    
    updateFormData({ income_types: updatedTypes });
  };

  const addCustomIncomeType = (customIncomeType: string) => {
    const currentTypes = formData.income_types || [];
    const customId = `custom_${customIncomeType.toLowerCase().replace(/\s+/g, '_')}`;
    
    if (!currentTypes.includes(customId)) {
      updateFormData({ 
        income_types: [...currentTypes, customId] 
      });
    }
  };

  const removeCustomIncomeType = (typeId: string) => {
    const currentTypes = formData.income_types || [];
    updateFormData({ 
      income_types: currentTypes.filter((type: string) => type !== typeId) 
    });
  };

  const getDisplayName = (typeId: string) => {
    const standardType = incomeTypes.find(type => type.id === typeId);
    if (standardType) return standardType.label;
    
    // For custom types, format the ID back to a readable format
    if (typeId.startsWith('custom_')) {
      return typeId.replace('custom_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return typeId;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Financial Profile</h3>
          <p className="text-sm text-gray-600 mb-6">Loading income types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Financial Profile</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Error loading income types. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!incomeTypes || incomeTypes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Financial Profile</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              No income types found in the database. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Financial Profile</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select all applicable income sources for this resident. This will help configure appropriate billing and payment processing.
        </p>
      </div>

      <div className="space-y-6">
        <IncomeTypesGrid
          incomeTypes={incomeTypes}
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

      {formData.income_types && formData.income_types.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            Please select at least one income type to continue. This information is required for billing setup.
          </p>
        </div>
      )}
    </div>
  );
}
