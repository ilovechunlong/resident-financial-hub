import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from './types';
import { DataFetchers } from './dataFetchers';

export interface NursingHomeExpenseReportItem {
  nursingHomeId: string;
  nursingHomeName: string;
  month: string;
  monthSort: string;
  totalExpenses: number;
  totalTransactions: number;
  expenseBreakdown: {
    category: string;
    totalAmount: number;
    transactionCount: number;
    transactions: {
      id: string;
      date: string;
      amount: number;
      description: string | null;
      paymentMethod: string | null;
      referenceNumber: string | null;
      status: string;
    }[];
  }[];
}

export class NursingHomeExpenseReportGenerator {
  static async generateData(dateRange?: DateRange, configId?: string): Promise<NursingHomeExpenseReportItem[]> {
    let nursingHomeId: string | null = null;
    if (configId) {
      const { data: config, error: configError } = await supabase
        .from('report_configurations')
        .select('nursing_home_id')
        .eq('id', configId)
        .single();
      
      if (configError) {
        console.error('Error fetching report configuration:', configError);
        throw configError;
      }
      
      nursingHomeId = config.nursing_home_id;
    }

    // Get nursing home details
    let nursingHomeQuery = supabase.from('nursing_homes').select('id, name');
    if (nursingHomeId) {
      nursingHomeQuery = nursingHomeQuery.eq('id', nursingHomeId);
    }
    
    const { data: nursingHomes, error: nhError } = await nursingHomeQuery;
    if (nhError) {
      console.error('Error fetching nursing homes:', nhError);
      throw nhError;
    }

    if (!nursingHomes || nursingHomes.length === 0) return [];

    // Get expense transactions for the nursing home(s)
    const transactions = await DataFetchers.getExpenseTransactions(
      nursingHomeId ? [nursingHomeId] : nursingHomes.map(nh => nh.id),
      dateRange
    );

    const result: NursingHomeExpenseReportItem[] = [];

    // Generate date range for months
    const startDate = dateRange?.start ? new Date(dateRange.start) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = dateRange?.end ? new Date(dateRange.end) : new Date();
    
    const months = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= endDate) {
      months.push({
        monthKey: format(current, 'yyyy-MM'),
        monthDisplay: format(current, 'MMM yyyy')
      });
      current.setMonth(current.getMonth() + 1);
    }

    // Process data for each nursing home and month
    nursingHomes.forEach((nursingHome) => {
      months.forEach(({ monthKey, monthDisplay }) => {
        const monthTransactions = (transactions || []).filter(t => {
          const tDate = new Date(t.transaction_date);
          return format(tDate, 'yyyy-MM') === monthKey && t.nursing_home_id === nursingHome.id;
        });

        // Group transactions by category
        const categoryMap = new Map<string, any[]>();
        monthTransactions.forEach(transaction => {
          const category = transaction.category;
          if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
          }
          categoryMap.get(category)!.push(transaction);
        });

        // Create expense breakdown
        const expenseBreakdown = Array.from(categoryMap.entries()).map(([category, categoryTransactions]) => ({
          category,
          totalAmount: categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
          transactionCount: categoryTransactions.length,
          transactions: categoryTransactions.map(t => ({
            id: t.id,
            date: t.transaction_date,
            amount: Number(t.amount),
            description: t.description,
            paymentMethod: t.payment_method,
            referenceNumber: t.reference_number,
            status: t.status
          }))
        })).sort((a, b) => b.totalAmount - a.totalAmount); // Sort by total amount descending

        result.push({
          nursingHomeId: nursingHome.id,
          nursingHomeName: nursingHome.name,
          month: monthDisplay,
          monthSort: monthKey,
          totalExpenses: monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
          totalTransactions: monthTransactions.length,
          expenseBreakdown
        });
      });
    });

    return result.sort((a, b) => {
      if (a.nursingHomeName !== b.nursingHomeName) {
        return a.nursingHomeName.localeCompare(b.nursingHomeName);
      }
      return a.monthSort.localeCompare(b.monthSort);
    });
  }
}