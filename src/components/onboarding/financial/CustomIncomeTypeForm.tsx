
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CustomIncomeTypeFormProps {
  onAddCustomType: (customType: string) => void;
}

export function CustomIncomeTypeForm({ onAddCustomType }: CustomIncomeTypeFormProps) {
  const [customIncomeType, setCustomIncomeType] = useState('');

  const handleAdd = () => {
    if (customIncomeType.trim()) {
      onAddCustomType(customIncomeType.trim());
      setCustomIncomeType('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
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
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!customIncomeType.trim()}
          >
            Add
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
