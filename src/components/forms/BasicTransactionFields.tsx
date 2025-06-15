
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FinancialTransactionFormValues } from './financialTransactionFormSchema';
import { FinancialCategory } from '@/types/financial';
import { TransactionTypeField } from './fields/TransactionTypeField';
import { CategoryField } from './fields/CategoryField';
import { AmountField } from './fields/AmountField';
import { TransactionDateField } from './fields/TransactionDateField';
import { PaymentMethodField } from './fields/PaymentMethodField';
import { StatusField } from './fields/StatusField';

interface BasicTransactionFieldsProps {
  form: UseFormReturn<FinancialTransactionFormValues>;
  categories: FinancialCategory[];
  watchTransactionType: 'income' | 'expense';
  residents?: any[];
  transactionScope: 'nursing_home' | 'resident';
}

export function BasicTransactionFields({ form, categories, watchTransactionType, residents = [], transactionScope }: BasicTransactionFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TransactionTypeField form={form} />
      <CategoryField 
        form={form} 
        categories={categories} 
        watchTransactionType={watchTransactionType}
        residents={residents}
        transactionScope={transactionScope}
      />
      <AmountField form={form} />
      <TransactionDateField form={form} />
      <PaymentMethodField form={form} />
      <StatusField form={form} />
    </div>
  );
}
