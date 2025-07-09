
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from './types';
import { DataFetchers } from './dataFetchers';

export interface NursingHomeExpenseCategory {
  category: string;
  totalAmount: number;
  transactionCount: number;
  transactions: {
    id: string;
    date: string;
    amount: number;
    description?: string;
    resident_name?: string;
    payment_method?: string;
    reference_number?: string;
  }[];
}

export interface NursingHomeExpenseSummaryItem {
  nursingHomeId: string;
  nursingHomeName: string;
  month: string;
  monthSort: string;
  totalExpenses: number;
  totalTransactions: number;
  expenseCategories: NursingHomeExpenseCategory[];
}

export class NursingHomeExpenseReportGenerator {
  static async generateData(dateRange?: DateRange, configId?: string): Promise<NursingHomeExpenseSummaryItem[]> {
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

    // Get nursing homes data
    const nursingHomes = await DataFetchers.getNursingHomes();
    let targetNursingHomes = nursingHomes;
    
    if (nursingHomeId) {
      targetNursingHomes = nursingHomes.filter(nh => nh.id === nursingHomeId);
    }

    if (!targetNursingHomes || targetNursingHomes.length === 0) return [];

    // Get all residents for the target nursing homes
    const residents = await DataFetchers.getResidentsWithNursingHome(nursingHomeId);
    if (!residents || residents.length === 0) return [];

    // Get expense transactions
    let query = supabase
      .from('financial_transactions')
      .select(`
        *,
        residents!inner(id, first_name, last_name, nursing_home_id)
      `)
      .eq('transaction_type', 'expense')
      .eq('status', 'completed');

    if (nursingHomeId) {
      query = query.eq('nursing_home_id', nursingHomeId);
    }

    if (dateRange?.start) {
      query = query.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte('transaction_date', dateRange.end);
    }

    const { data: transactions, error } = await query;
    if (error) throw error;

    const analysisMap = new Map<string, NursingHomeExpenseSummaryItem>();

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

    // Initialize data structure
    targetNursingHomes.forEach(nursingHome => {
      months.forEach(({ monthKey, monthDisplay }) => {
        const nhMonthKey = `${nursingHome.id}-${monthKey}`;
        
        if (!analysisMap.has(nhMonthKey)) {
          analysisMap.set(nhMonthKey, {
            nursingHomeId: nursingHome.id,
            nursingHomeName: nursingHome.name,
            month: monthDisplay,
            monthSort: monthKey,
            totalExpenses: 0,
            totalTransactions: 0,
            expenseCategories: []
          });
        }
      });
    });

    // Process transactions
    (transactions || []).forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = format(date, 'yyyy-MM');
      const resident = transaction.residents;
      const nhId = transaction.nursing_home_id || resident?.nursing_home_id;
      
      if (nhId) {
        const nhMonthKey = `${nhId}-${monthKey}`;
        const nhMonthData = analysisMap.get(nhMonthKey);
        
        if (nhMonthData) {
          const amount = Number(transaction.amount);
          
          // Find or create category
          let categoryData = nhMonthData.expenseCategories.find(c => c.category === transaction.category);
          if (!categoryData) {
            categoryData = {
              category: transaction.category,
              totalAmount: 0,
              transactionCount: 0,
              transactions: []
            };
            nhMonthData.expenseCategories.push(categoryData);
          }
          
          categoryData.totalAmount += amount;
          categoryData.transactionCount += 1;
          categoryData.transactions.push({
            id: transaction.id,
            date: transaction.transaction_date,
            amount: amount,
            description: transaction.description,
            resident_name: resident ? `${resident.first_name} ${resident.last_name}` : undefined,
            payment_method: transaction.payment_method,
            reference_number: transaction.reference_number
          });
          
          nhMonthData.totalExpenses += amount;
          nhMonthData.totalTransactions += 1;
        }
      }
    });

    // Sort categories by total amount and return results
    analysisMap.forEach(nhMonthData => {
      nhMonthData.expenseCategories.sort((a, b) => b.totalAmount - a.totalAmount);
    });

    const result = Array.from(analysisMap.values()).sort((a, b) => {
      if (a.nursingHomeName !== b.nursingHomeName) {
        return a.nursingHomeName.localeCompare(b.nursingHomeName);
      }
      return a.monthSort.localeCompare(b.monthSort);
    });

    return result;
  }
}
