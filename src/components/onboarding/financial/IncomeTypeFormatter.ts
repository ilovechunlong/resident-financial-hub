import { IncomeTypeCategoryMapping } from '@/types/financial';

export const formatIncomeTypeLabel = (type: string): string => {
  switch (type) {
    case 'ssi':
      return 'SSI (Supplemental Security Income)';
    case 'ssdi':
      return 'SSDI (Social Security Disability Insurance)';
    case 'medicaid':
      return 'Medicaid';
    case 'medicare':
      return 'Medicare';
    case 'private_insurance':
      return 'Private Insurance';
    case 'private_pay':
      return 'Private Pay';
    case 'grant':
      return 'Grant';
    case 'waiver':
      return 'Waiver';
    case 'veteran_benefits':
      return 'Veteran Benefits';
    case 'other':
      return 'Other';
    default:
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

export const getIncomeTypeDescription = (type: string): string => {
  switch (type) {
    case 'ssi':
      return 'Federal income supplement program';
    case 'ssdi':
      return 'Federal insurance program';
    case 'medicaid':
      return 'Government health insurance';
    case 'medicare':
      return 'Federal health insurance';
    case 'private_insurance':
      return 'Private health insurance';
    case 'private_pay':
      return 'Private payment';
    case 'grant':
      return 'Government or private grants';
    case 'waiver':
      return 'Medicaid waiver programs';
    case 'veteran_benefits':
      return 'VA benefits and support';
    case 'other':
      return 'Other income sources';
    default:
      return 'Additional income source';
  }
};

// Fallback income types if database is empty
const defaultIncomeTypes = [
  'ssi',
  'ssdi', 
  'medicaid',
  'medicare',
  'private_insurance',
  'private_pay',
  'grant',
  'waiver',
  'veteran_benefits',
  'other'
];

export const formatIncomeTypes = (incomeTypeMappings: IncomeTypeCategoryMapping[] | undefined) => {
  console.log('=== IncomeTypeFormatter Debug ===');
  console.log('Raw income type mappings received:', incomeTypeMappings);
  
  if (!incomeTypeMappings || incomeTypeMappings.length === 0) {
    console.log('No income type mappings found or data is empty, returning empty array.');
    return [];
  }
  
  // Extract unique income types from the mappings
  const uniqueIncomeTypes = Array.from(
    new Set(incomeTypeMappings.map(mapping => mapping.income_type))
  );
  
  console.log('Unique income types from database:', uniqueIncomeTypes);
  
  // Format them for display
  const formattedTypes = uniqueIncomeTypes.map(incomeType => ({
    id: incomeType,
    label: formatIncomeTypeLabel(incomeType),
    description: getIncomeTypeDescription(incomeType)
  }));
  
  console.log('Final formatted income types:', formattedTypes);
  
  return formattedTypes;
};
