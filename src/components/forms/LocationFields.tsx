
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
import { FinancialTransactionFormValues } from './financialTransactionFormSchema';

interface LocationFieldsProps {
  form: UseFormReturn<FinancialTransactionFormValues>;
  nursingHomes: any[];
  residents: any[];
}

export function LocationFields({ form, nursingHomes, residents }: LocationFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="nursing_home_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nursing Home (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select nursing home" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {nursingHomes.map((home) => (
                  <SelectItem key={home.id} value={home.id}>
                    {home.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="resident_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Resident (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select resident" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {residents.map((resident) => (
                  <SelectItem key={resident.id} value={resident.id}>
                    {resident.first_name} {resident.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
