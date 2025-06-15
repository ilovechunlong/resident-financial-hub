
import { IncomeTypeCategoryMapping } from '@/types/financial';

export const formatIncomeTypes = (incomeTypeMappings: IncomeTypeCategoryMapping[] | undefined) => {
  console.log('=== IncomeTypeFormatter Debug ===');
  console.log('Raw income type mappings received:', incomeTypeMappings);
  
  if (!incomeTypeMappings || incomeTypeMappings.length === 0) {
    console.log('No income type mappings found or data is empty, returning empty array.');
    return [];
  }
  
  const formattedTypes = incomeTypeMappings.map(mapping => ({
    id: mapping.id,
    label: mapping.display_label,
    description: mapping.description
  }));
  
  console.log('Final formatted income types:', formattedTypes);
  
  return formattedTypes;
};
