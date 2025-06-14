
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialCategories, useAddFinancialTransaction } from '@/hooks/useFinancialTransactions';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { useResidents } from '@/hooks/useResidents';
import { FinancialTransactionFormData } from '@/types/financial';
import { financialTransactionFormSchema, FinancialTransactionFormValues } from './forms/financialTransactionFormSchema';
import { BasicTransactionFields } from './forms/BasicTransactionFields';
import { LocationFields } from './forms/LocationFields';
import { AdditionalDetailsFields } from './forms/AdditionalDetailsFields';
import { RecurringTransactionFields } from './forms/RecurringTransactionFields';

interface FinancialTransactionFormProps {
  onSuccess?: () => void;
}

export function FinancialTransactionForm({ onSuccess }: FinancialTransactionFormProps) {
  const { data: categories = [] } = useFinancialCategories();
  const { nursingHomes = [] } = useNursingHomes();
  const { residents = [] } = useResidents();
  const addTransaction = useAddFinancialTransaction();

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
            <BasicTransactionFields 
              form={form} 
              categories={categories} 
              watchTransactionType={watchTransactionType}
              residents={residents}
            />

            <LocationFields 
              form={form} 
              nursingHomes={nursingHomes} 
              residents={residents} 
            />

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
