
import { IncomeTypeCategoryMapping } from '@/types/financial';

export const formatIncomeTypes = (incomeTypeMappings: IncomeTypeCategoryMapping[] | undefined) => {
  console.log('=== IncomeTypeFormatter Debug ===');
  console.log('Raw income type mappings received:', incomeTypeMappings);
  
  if (!incomeTypeMappings || incomeTypeMappings.length === 0) {
    console.log('No income type mappings found or data is empty, returning empty array.');
    return [];
  }
  
  const incomeTypeMap = new Map<string, { label: string; description: string }>();

  incomeTypeMappings.forEach(mapping => {
    if (!incomeTypeMap.has(mapping.income_type)) {
      incomeTypeMap.set(mapping.income_type, {
        label: mapping.display_label,
        description: mapping.description,
      });
    }
  });

  const formattedTypes = Array.from(incomeTypeMap.entries()).map(([id, { label, description }]) => ({
    id,
    label,
    description
  }));
  
  console.log('Final formatted income types:', formattedTypes);
  
  return formattedTypes;
};
