import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FinancialTransactionFormValues } from './financialTransactionFormSchema';
import { FinancialCategory } from '@/types/financial';

interface BasicTransactionFieldsProps {
  form: UseFormReturn<FinancialTransactionFormValues>;
  categories: FinancialCategory[];
  watchTransactionType: 'income' | 'expense';
  residents?: any[];
}

export function BasicTransactionFields({ form, categories, watchTransactionType, residents = [] }: BasicTransactionFieldsProps) {
  const watchResidentId = form.watch('resident_id');
  
  // Find the selected resident
  const selectedResident = residents.find(resident => resident.id === watchResidentId);
  
  console.log('Debug BasicTransactionFields:', {
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
      
      filteredCategories = filteredCategories.filter(category => 
        selectedResident.income_types.includes(category.name)
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="transaction_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Transaction Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

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

      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount ($)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="transaction_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Transaction Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="payment_method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Method</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
