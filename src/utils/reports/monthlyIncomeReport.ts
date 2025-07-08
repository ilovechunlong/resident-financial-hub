
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from './types';
import { DataFetchers } from './dataFetchers';
import { MonthlyIncomeReportItem, ResidentDetail } from '@/types/reportTypes';

export class MonthlyIncomeReportGenerator {
  static async generateData(dateRange?: DateRange, configId?: string): Promise<MonthlyIncomeReportItem[]> {
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

    const transactions = await DataFetchers.getIncomeTransactions(
      residents.map(r => r.id),
      dateRange
    );

    const result: MonthlyIncomeReportItem[] = [];
    const nursingHomeMap = new Map<string, any>();

    residents.forEach(resident => {
      const nhId = resident.nursing_home_id;
      if (!nursingHomeMap.has(nhId)) {
        nursingHomeMap.set(nhId, {
          nursingHomeId: nhId,
          nursingHomeName: resident.nursing_homes?.name || 'Unknown',
          residents: []
        });
      }
      nursingHomeMap.get(nhId).residents.push(resident);
    });

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

    nursingHomeMap.forEach((nhData) => {
      months.forEach(({ monthKey, monthDisplay }) => {
        const monthTransactions = (transactions || []).filter(t => {
          const tDate = new Date(t.transaction_date);
          return format(tDate, 'yyyy-MM') === monthKey;
        });

        const residentDetails: ResidentDetail[] = nhData.residents.map((resident: any) => {
          const residentTransactions = monthTransactions.filter(t => t.resident_id === resident.id);
          const expectedIncomeTypes = resident.income_types || [];
          const actualIncomeTypes = [...new Set(residentTransactions.map(t => t.category))];
          const missingIncomeTypes = expectedIncomeTypes.filter(type => !actualIncomeTypes.includes(type));

          return {
            residentId: resident.id,
            residentName: `${resident.first_name} ${resident.last_name}`,
            expectedIncomeTypes,
            totalIncome: residentTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
            transactionCount: residentTransactions.length,
            hasIncomeIssues: missingIncomeTypes.length > 0,
            missingIncomeTypes,
            actualTransactions: residentTransactions.map(t => ({
              id: t.id,
              date: t.transaction_date,
              amount: Number(t.amount),
              category: t.category,
              description: t.description,
              paymentMethod: t.payment_method,
              referenceNumber: t.reference_number,
              status: t.status
            }))
          };
        });

        result.push({
          nursingHomeId: nhData.nursingHomeId,
          nursingHomeName: nhData.nursingHomeName,
          month: monthDisplay,
          monthSort: monthKey,
          totalIncome: residentDetails.reduce((sum, r) => sum + r.totalIncome, 0),
          totalTransactions: residentDetails.reduce((sum, r) => sum + r.transactionCount, 0),
          residentDetails
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
