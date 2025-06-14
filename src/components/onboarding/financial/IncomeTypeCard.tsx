
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

interface IncomeTypeCardProps {
  incomeType: {
    id: string;
    label: string;
    description: string;
  };
  isSelected: boolean;
  onSelectionChange: (incomeTypeId: string, checked: boolean) => void;
}

export function IncomeTypeCard({ incomeType, isSelected, onSelectionChange }: IncomeTypeCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id={incomeType.id}
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(incomeType.id, checked as boolean)}
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
  );
}
