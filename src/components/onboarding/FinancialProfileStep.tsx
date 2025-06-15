import { useFinancialCategories } from '@/hooks/useFinancialTransactions';
import { IncomeTypesGrid } from './financial/IncomeTypesGrid';
import { CustomIncomeTypeForm } from './financial/CustomIncomeTypeForm';
import { SelectedIncomeTypes } from './financial/SelectedIncomeTypes';

interface FinancialProfileStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function FinancialProfileStep({ formData, updateFormData }: FinancialProfileStepProps) {
  const { data: allCategories, isLoading, error } = useFinancialCategories();

  const incomeTypes = (allCategories || [])
    .filter(cat => cat.transaction_type === 'income' && cat.category_scope === 'resident')
    .map(cat => ({
      id: cat.name,
      label: cat.name,
      description: cat.description,
    }));

  console.log('=== FinancialProfileStep Debug ===');
  console.log('Income type mappings from database:', incomeTypes);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

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
    console.error('Error in FinancialProfileStep:', error);
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Financial Profile</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Error loading income types: {error.message || 'Unknown error'}. Please try again later.
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
        {!isLoading && incomeTypes.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm">
              No resident income categories found. Please add a custom one below, or configure them in the application settings.
            </p>
          </div>
        )}
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
