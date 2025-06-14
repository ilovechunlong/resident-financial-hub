
import { Label } from '@/components/ui/label';
import { IncomeTypeCard } from './IncomeTypeCard';

interface IncomeType {
  id: string;
  label: string;
  description: string;
}

interface IncomeTypesGridProps {
  incomeTypes: IncomeType[];
  selectedTypes: string[];
  onSelectionChange: (incomeTypeId: string, checked: boolean) => void;
}

export function IncomeTypesGrid({ incomeTypes, selectedTypes, onSelectionChange }: IncomeTypesGridProps) {
  return (
    <div>
      <Label className="text-base font-medium mb-4 block">Income Types *</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incomeTypes.map((incomeType) => (
          <IncomeTypeCard
            key={incomeType.id}
            incomeType={incomeType}
            isSelected={selectedTypes?.includes(incomeType.id) || false}
            onSelectionChange={onSelectionChange}
          />
        ))}
      </div>
    </div>
  );
}
