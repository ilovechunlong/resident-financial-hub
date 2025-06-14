
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface SelectedIncomeTypesProps {
  selectedTypes: string[];
  getDisplayName: (typeId: string) => string;
  onRemoveCustomType: (typeId: string) => void;
}

export function SelectedIncomeTypes({ selectedTypes, getDisplayName, onRemoveCustomType }: SelectedIncomeTypesProps) {
  if (!selectedTypes || selectedTypes.length === 0) {
    return null;
  }

  return (
    <div>
      <Label className="text-base font-medium mb-3 block">Selected Income Types</Label>
      <div className="flex flex-wrap gap-2">
        {selectedTypes.map((typeId: string) => (
          <Badge
            key={typeId}
            variant="secondary"
            className="flex items-center gap-2 px-3 py-1"
          >
            {getDisplayName(typeId)}
            {typeId.startsWith('custom_') && (
              <button
                onClick={() => onRemoveCustomType(typeId)}
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
  );
}
