
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FinancialTransactionFormValues } from '../financialTransactionFormSchema';

interface TransactionDateFieldProps {
  form: UseFormReturn<FinancialTransactionFormValues>;
}

export function TransactionDateField({ form }: TransactionDateFieldProps) {
  return (
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
  );
}
