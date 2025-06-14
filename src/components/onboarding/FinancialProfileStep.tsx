
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FinancialProfileStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const incomeTypes = [
  { id: 'ssi', label: 'SSI (Supplemental Security Income)', description: 'Federal income supplement program' },
  { id: 'ssdi', label: 'SSDI (Social Security Disability Insurance)', description: 'Federal insurance program' },
  { id: 'grant', label: 'Grant', description: 'Government or private grants' },
  { id: 'waiver', label: 'Waiver', description: 'Medicaid waiver programs' },
  { id: 'pension', label: 'Pension', description: 'Retirement pension benefits' },
  { id: 'family_support', label: 'Family Support', description: 'Financial support from family' },
  { id: 'other', label: 'Other', description: 'Other income sources' },
];

export function FinancialProfileStep({ formData, updateFormData }: FinancialProfileStepProps) {
  const [customIncomeType, setCustomIncomeType] = useState('');

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

  const addCustomIncomeType = () => {
    if (customIncomeType.trim()) {
      const currentTypes = formData.income_types || [];
      const customId = `custom_${customIncomeType.toLowerCase().replace(/\s+/g, '_')}`;
      
      if (!currentTypes.includes(customId)) {
        updateFormData({ 
          income_types: [...currentTypes, customId] 
        });
      }
      setCustomIncomeType('');
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Financial Profile</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select all applicable income sources for this resident. This will help configure appropriate billing and payment processing.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-4 block">Income Types *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomeTypes.map((incomeType) => (
              <Card key={incomeType.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={incomeType.id}
                      checked={formData.income_types?.includes(incomeType.id) || false}
                      onCheckedChange={(checked) => handleIncomeTypeChange(incomeType.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={incomeType.id}
                        className="text-sm font-medium text-gray-900 cursor-pointer block"
                      >
                        {incomeType.label}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {incomeType.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Income Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Custom Income Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom income type"
                value={customIncomeType}
                onChange={(e) => setCustomIncomeType(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomIncomeType();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomIncomeType}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={!customIncomeType.trim()}
              >
                Add
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Selected Income Types */}
        {formData.income_types && formData.income_types.length > 0 && (
          <div>
            <Label className="text-base font-medium mb-3 block">Selected Income Types</Label>
            <div className="flex flex-wrap gap-2">
              {formData.income_types.map((typeId: string) => (
                <Badge
                  key={typeId}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {getDisplayName(typeId)}
                  {typeId.startsWith('custom_') && (
                    <button
                      onClick={() => removeCustomIncomeType(typeId)}
                      className="text-red-500 hover:text-red-700 ml-1"
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
