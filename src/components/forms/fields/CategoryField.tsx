
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FinancialTransactionFormValues } from '../financialTransactionFormSchema';
import { FinancialCategory } from '@/types/financial';

interface CategoryFieldProps {
  form: UseFormReturn<FinancialTransactionFormValues>;
  categories: FinancialCategory[];
  watchTransactionType: 'income' | 'expense';
  residents?: any[];
}

// Mapping between income type codes and financial category names
const INCOME_TYPE_TO_CATEGORY_MAPPING: Record<string, string[]> = {
  'ssi': ['Government Funding'],
  'ssdi': ['Government Funding'],
  'medicaid': ['Insurance Payments'],
  'medicare': ['Insurance Payments'],
  'private_insurance': ['Insurance Payments'],
  'private_pay': ['Resident Fees'],
  'grant': ['Government Funding', 'Donations'],
  'waiver': ['Government Funding'],
  'veteran_benefits': ['Government Funding'],
  'other': ['Additional Services', 'Donations']
};

export function CategoryField({ form, categories, watchTransactionType, residents = [] }: CategoryFieldProps) {
  const watchResidentId = form.watch('resident_id');
  
  // Find the selected resident
  const selectedResident = residents.find(resident => resident.id === watchResidentId);
  
  console.log('Debug CategoryField:', {
    watchTransactionType,
    watchResidentId,
    selectedResident,
    totalCategories: categories.length,
    residents: residents.length
  });

  // Filter categories based on transaction type and resident's income types
  const getFilteredCategories = () => {
    console.log('All categories:', categories);
    
    let filteredCategories = categories.filter(
      category => category.transaction_type === watchTransactionType
    );
    
    console.log('Categories after transaction type filter:', filteredCategories);

    // If transaction type is income and a resident is selected, filter by resident's income types
    if (watchTransactionType === 'income' && selectedResident && selectedResident.income_types) {
      console.log('Selected resident income types:', selectedResident.income_types);
      
      // Get all allowed category names based on the resident's income types
      const allowedCategoryNames: string[] = [];
      
      selectedResident.income_types.forEach((incomeType: string) => {
        const mappedCategories = INCOME_TYPE_TO_CATEGORY_MAPPING[incomeType] || [];
        allowedCategoryNames.push(...mappedCategories);
      });
      
      // Remove duplicates
      const uniqueAllowedCategoryNames = [...new Set(allowedCategoryNames)];
      
      console.log('Allowed category names based on income types:', uniqueAllowedCategoryNames);
      
      filteredCategories = filteredCategories.filter(category => 
        uniqueAllowedCategoryNames.includes(category.name)
      );
      
      console.log('Categories after income types filter:', filteredCategories);
    }

    return filteredCategories;
  };

  const filteredCategories = getFilteredCategories();

  // Clear category when resident changes and transaction type is income
  useEffect(() => {
    if (watchTransactionType === 'income' && watchResidentId) {
      const currentCategory = form.getValues('category');
      const isCurrentCategoryValid = filteredCategories.some(cat => cat.name === currentCategory);
      
      if (!isCurrentCategoryValid) {
        form.setValue('category', '');
      }
    }
  }, [watchResidentId, watchTransactionType, form, filteredCategories]);

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-categories-available" disabled>
                  No categories available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
