
import * as z from 'zod';

export const financialTransactionFormSchema = z.object({
  transaction_type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().optional(),
  transaction_date: z.string().min(1, 'Date is required'),
  payment_method: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'insurance']).optional(),
  reference_number: z.string().optional(),
  nursing_home_id: z.string().optional(),
  resident_id: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional().nullable(),
  status: z.enum(['pending', 'completed', 'cancelled']).default('completed'),
}).refine((data) => {
  // If is_recurring is true, then recurring_frequency must be provided
  if (data.is_recurring && !data.recurring_frequency) {
    return false;
  }
  return true;
}, {
  message: "Recurring frequency is required when transaction is recurring",
  path: ["recurring_frequency"],
});

export type FinancialTransactionFormValues = z.infer<typeof financialTransactionFormSchema>;
