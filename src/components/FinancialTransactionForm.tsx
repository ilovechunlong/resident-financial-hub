
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialCategories, useAddFinancialTransaction } from '@/hooks/useFinancialTransactions';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { useResidents } from '@/hooks/useResidents';
import { FinancialTransactionFormData } from '@/types/financial';
import { financialTransactionFormSchema, FinancialTransactionFormValues } from './forms/financialTransactionFormSchema';
import { BasicTransactionFields } from './forms/BasicTransactionFields';
import { AdditionalDetailsFields } from './forms/AdditionalDetailsFields';
import { RecurringTransactionFields } from './forms/RecurringTransactionFields';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FinancialTransactionFormProps {
  onSuccess?: () => void;
}

export function FinancialTransactionForm({ onSuccess }: FinancialTransactionFormProps) {
  const { data: categories = [] } = useFinancialCategories();
  const { nursingHomes = [] } = useNursingHomes();
  const { residents = [] } = useResidents();
  const addTransaction = useAddFinancialTransaction();
  const [transactionScope, setTransactionScope] = useState<'nursing_home' | 'resident'>('nursing_home');

  const form = useForm<FinancialTransactionFormValues>({
    resolver: zodResolver(financialTransactionFormSchema),
    defaultValues: {
      transaction_type: 'income',
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'completed',
      is_recurring: false,
    },
  });

  const watchTransactionType = form.watch('transaction_type');
  const watchIsRecurring = form.watch('is_recurring');

  const handleScopeChange = (scope: 'nursing_home' | 'resident') => {
    setTransactionScope(scope);
    // Reset dependent fields when scope changes
    form.setValue('nursing_home_id', undefined);
    form.setValue('resident_id', undefined);
    form.setValue('category', '');
  };

  const onSubmit = async (values: FinancialTransactionFormValues) => {
    const transactionData: FinancialTransactionFormData = {
      transaction_type: values.transaction_type,
      category: values.category,
      amount: values.amount,
      description: values.description || undefined,
      transaction_date: values.transaction_date,
      payment_method: values.payment_method || undefined,
      reference_number: values.reference_number || undefined,
      nursing_home_id: values.nursing_home_id || undefined,
      resident_id: values.resident_id || undefined,
      is_recurring: values.is_recurring || false,
      recurring_frequency: values.is_recurring ? values.recurring_frequency : undefined,
      status: values.status,
    };

    await addTransaction.mutateAsync(transactionData);
    form.reset();
    setTransactionScope('nursing_home');
    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Financial Transaction</CardTitle>
        <CardDescription>
          Record a new income or expense transaction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormItem className="space-y-3">
              <FormLabel>Transaction For</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: 'nursing_home' | 'resident') => handleScopeChange(value)}
                  defaultValue={transactionScope}
                  className="flex items-center space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="nursing_home" />
                    </FormControl>
                    <FormLabel className="font-normal">Nursing Home</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="resident" />
                    </FormControl>
                    <FormLabel className="font-normal">Resident</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
            
            <BasicTransactionFields 
              form={form} 
              categories={categories} 
              watchTransactionType={watchTransactionType}
              residents={residents}
              transactionScope={transactionScope}
            />

            {transactionScope === 'nursing_home' && (
              <FormField
                control={form.control}
                name="nursing_home_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nursing Home</FormLabel>
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
            )}

            {transactionScope === 'resident' && (
              <FormField
                control={form.control}
                name="resident_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resident</FormLabel>
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
            )}

            <AdditionalDetailsFields form={form} />

            <RecurringTransactionFields 
              form={form} 
              watchIsRecurring={watchIsRecurring} 
            />

            <Button type="submit" className="w-full" disabled={addTransaction.isPending}>
              {addTransaction.isPending ? 'Adding Transaction...' : 'Add Transaction'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
