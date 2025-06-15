import React, { useEffect, useMemo } from 'react';
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
  transactionScope: 'nursing_home' | 'resident';
}

export function CategoryField({ form, categories, watchTransactionType, residents = [], transactionScope }: CategoryFieldProps) {
  const watchResidentId = form.watch('resident_id');
  
  const selectedResident = residents.find(resident => resident.id === watchResidentId);
  
  const filteredCategories = useMemo(() => {
    let filtered = categories.filter(
      category => category.category_scope === transactionScope && category.transaction_type === watchTransactionType
    );

    if (transactionScope === 'resident' && watchTransactionType === 'income' && selectedResident && selectedResident.income_types) {
      const allowedCategoryNames: string[] = selectedResident.income_types;
      
      filtered = filtered.filter(category => 
        allowedCategoryNames.includes(category.name)
      );
    }

    return filtered;
  }, [categories, transactionScope, watchTransactionType, selectedResident]);

  useEffect(() => {
    const currentCategory = form.getValues('category');
    if (currentCategory) {
      const isCurrentCategoryValid = filteredCategories.some(cat => cat.name === currentCategory);
      if (!isCurrentCategoryValid) {
        form.setValue('category', '', { shouldValidate: true });
      }
    }
  }, [filteredCategories, form]);

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
