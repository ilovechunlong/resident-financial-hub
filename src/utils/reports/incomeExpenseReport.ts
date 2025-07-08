
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from './types';
import { DataFetchers } from './dataFetchers';
import { IncomeExpenseSummaryReportItem, ResidentIncomeExpenseSummary, MonthlyExpenseCategory } from '@/types/reportTypes';

export class IncomeExpenseReportGenerator {
  static async generateData(dateRange?: DateRange, configId?: string): Promise<IncomeExpenseSummaryReportItem[]> {
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

    const residents = await DataFetchers.getResidentsWithNursingHome(nursingHomeId);
    if (!residents || residents.length === 0) return [];

    const transactions = await DataFetchers.getAllTransactions(
      residents.map(r => r.id),
      dateRange
    );

    const analysisMap = new Map<string, IncomeExpenseSummaryReportItem>();

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
    residents.forEach(resident => {
      const residentNursingHomeId = resident.nursing_home_id;
      const nursingHomeName = resident.nursing_homes?.name || 'Unknown';
      const residentName = `${resident.first_name} ${resident.last_name}`;

      months.forEach(({ monthKey, monthDisplay }) => {
        const nhMonthKey = `${residentNursingHomeId}-${monthKey}`;
        
        if (!analysisMap.has(nhMonthKey)) {
          analysisMap.set(nhMonthKey, {
            nursingHomeId: residentNursingHomeId,
            nursingHomeName,
            month: monthDisplay,
            monthSort: monthKey,
            totalIncome: 0,
            totalExpenses: 0,
            netAmount: 0,
            residentSummaries: []
          });
        }

        const nhMonthData = analysisMap.get(nhMonthKey)!;
        
        const existingResident = nhMonthData.residentSummaries.find(r => r.residentId === resident.id);
        if (!existingResident) {
          nhMonthData.residentSummaries.push({
            residentId: resident.id,
            residentName,
            monthlyIncome: 0,
            monthlyExpenses: [],
            totalExpenses: 0,
            netAmount: 0
          });
        }
      });
    });

    // Process transactions
    (transactions || []).forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = format(date, 'yyyy-MM');
      const resident = residents.find(r => r.id === transaction.resident_id);
      
      if (resident) {
        const nhMonthKey = `${resident.nursing_home_id}-${monthKey}`;
        const nhMonthData = analysisMap.get(nhMonthKey);
        
        if (nhMonthData) {
          const residentData = nhMonthData.residentSummaries.find(r => r.residentId === resident.id);
          if (residentData) {
            const amount = Number(transaction.amount);
            
            if (transaction.transaction_type === 'income') {
              residentData.monthlyIncome += amount;
              nhMonthData.totalIncome += amount;
            } else if (transaction.transaction_type === 'expense') {
              let categoryData = residentData.monthlyExpenses.find(c => c.category === transaction.category);
              if (!categoryData) {
                categoryData = {
                  category: transaction.category,
                  totalAmount: 0,
                  transactionCount: 0,
                  transactions: []
                };
                residentData.monthlyExpenses.push(categoryData);
              }
              
              categoryData.totalAmount += amount;
              categoryData.transactionCount += 1;
              categoryData.transactions.push({
                id: transaction.id,
                date: transaction.transaction_date,
                amount: amount,
                category: transaction.category,
                description: transaction.description,
                paymentMethod: transaction.payment_method,
                referenceNumber: transaction.reference_number,
                status: transaction.status
              });
              
              residentData.totalExpenses += amount;
              nhMonthData.totalExpenses += amount;
            }
          }
        }
      }
    });

    // Calculate net amounts and sort
    analysisMap.forEach(nhMonthData => {
      nhMonthData.netAmount = nhMonthData.totalIncome - nhMonthData.totalExpenses;
      nhMonthData.residentSummaries.forEach(residentData => {
        residentData.netAmount = residentData.monthlyIncome - residentData.totalExpenses;
        residentData.monthlyExpenses.sort((a, b) => b.totalAmount - a.totalAmount);
      });
      nhMonthData.residentSummaries.sort((a, b) => b.netAmount - a.netAmount);
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
