
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
import { Textarea } from '@/components/ui/textarea';
import { FinancialTransactionFormValues } from './financialTransactionFormSchema';

interface AdditionalDetailsFieldsProps {
  form: UseFormReturn<FinancialTransactionFormValues>;
}

export function AdditionalDetailsFields({ form }: AdditionalDetailsFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="reference_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reference Number (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Reference or invoice number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Additional details about this transaction" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
