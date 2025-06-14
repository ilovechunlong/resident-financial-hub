
import React from 'react';
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
import { Switch } from '@/components/ui/switch';
import { FinancialTransactionFormValues } from './financialTransactionFormSchema';

interface RecurringTransactionFieldsProps {
  form: UseFormReturn<FinancialTransactionFormValues>;
  watchIsRecurring: boolean;
}

export function RecurringTransactionFields({ form, watchIsRecurring }: RecurringTransactionFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="is_recurring"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Recurring Transaction</FormLabel>
              <div className="text-sm text-muted-foreground">
                This transaction repeats on a schedule
              </div>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {watchIsRecurring && (
        <FormField
          control={form.control}
          name="recurring_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recurring Frequency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
