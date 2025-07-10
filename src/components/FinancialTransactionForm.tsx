
import React, { useEffect } from 'react';
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
import { useFinancialCategories, useAddFinancialTransaction, useUpdateFinancialTransaction } from '@/hooks/useFinancialTransactions';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { useResidents } from '@/hooks/useResidents';
import { FinancialTransaction, FinancialTransactionFormData } from '@/types/financial';
import { financialTransactionFormSchema, FinancialTransactionFormValues } from './forms/financialTransactionFormSchema';
import { BasicTransactionFields } from './forms/BasicTransactionFields';
import { AdditionalDetailsFields } from './forms/AdditionalDetailsFields';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FinancialTransactionFormProps {
  onSuccess?: () => void;
  initialData?: FinancialTransaction;
}

export function FinancialTransactionForm({ onSuccess, initialData }: FinancialTransactionFormProps) {
  const { data: categories = [] } = useFinancialCategories();
  const { nursingHomes = [] } = useNursingHomes();
  const { residents = [] } = useResidents();
  const addTransaction = useAddFinancialTransaction();
  const updateTransaction = useUpdateFinancialTransaction();

  const isEditing = !!initialData;

  console.log('FinancialTransactionForm render:', {
    isEditing,
    initialData: initialData ? { id: initialData.id, category: initialData.category } : null
  });

  const form = useForm<FinancialTransactionFormValues>({
    resolver: zodResolver(financialTransactionFormSchema),
    defaultValues: initialData ? {
      transaction_type: initialData.transaction_type,
      category: initialData.category,
      amount: initialData.amount,
      description: initialData.description || '',
      transaction_date: initialData.transaction_date,
      payment_method: initialData.payment_method,
      reference_number: initialData.reference_number || '',
      nursing_home_id: initialData.nursing_home_id || '',
      resident_id: initialData.resident_id || '',
      status: initialData.status,
      is_recurring: initialData.is_recurring || false,
      recurring_frequency: initialData.recurring_frequency,
    } : {
      transaction_type: 'income',
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'completed',
    },
  });

  const watchTransactionType = form.watch('transaction_type');
  const watchResidentId = form.watch('resident_id');
  const watchNursingHomeId = form.watch('nursing_home_id');

  const transactionScope = watchResidentId ? 'resident' : 'nursing_home';

  useEffect(() => {
    const selectedResident = residents.find(r => r.id === watchResidentId);
    if (watchResidentId && selectedResident) {
      if (selectedResident.nursing_home_id) {
        form.setValue('nursing_home_id', selectedResident.nursing_home_id, { shouldValidate: true });
      }
    }
  }, [watchResidentId, residents, form]);

  useEffect(() => {
    if (watchNursingHomeId && !watchResidentId && watchTransactionType !== 'expense') {
      form.setValue('transaction_type', 'expense', { shouldValidate: true });
    }
  }, [watchNursingHomeId, watchResidentId, watchTransactionType, form]);

  const onSubmit = async (values: FinancialTransactionFormValues) => {
    console.log('Form submitted with values:', values);
    console.log('Is editing:', isEditing);
    console.log('Initial data ID:', initialData?.id);

    try {
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
        status: values.status,
        is_recurring: values.is_recurring,
        recurring_frequency: values.recurring_frequency,
      };

      console.log('Prepared transaction data:', transactionData);

      if (isEditing && initialData) {
        console.log('Calling update mutation with ID:', initialData.id);
        const result = await updateTransaction.mutateAsync({ id: initialData.id, ...transactionData });
        console.log('Update mutation result:', result);
      } else {
        console.log('Calling add mutation');
        const result = await addTransaction.mutateAsync(transactionData);
        console.log('Add mutation result:', result);
      }
      
      if (!isEditing) {
        form.reset();
      }
      
      console.log('Calling onSuccess callback');
      onSuccess?.();
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Transaction' : 'Add Financial Transaction'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update the transaction details' : 'Record a new income or expense transaction'}
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
              transactionScope={transactionScope}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resident_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resident (Optional)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "_NONE_" ? undefined : value)} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select resident" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_NONE_">None</SelectItem>
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

              <FormField
                control={form.control}
                name="nursing_home_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nursing Home {watchResidentId ? '' : '(Optional)'}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "_NONE_" ? undefined : value)} value={field.value ?? ""} disabled={!!watchResidentId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nursing home" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!watchResidentId && <SelectItem value="_NONE_">None</SelectItem>}
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
            </div>

            <AdditionalDetailsFields form={form} />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={addTransaction.isPending || updateTransaction.isPending}
            >
              {addTransaction.isPending || updateTransaction.isPending 
                ? (isEditing ? 'Updating Transaction...' : 'Adding Transaction...') 
                : (isEditing ? 'Update Transaction' : 'Add Transaction')
              }
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
