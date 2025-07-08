
import { DataFetchers } from './dataFetchers';
import { DateRange } from './types';

export class BasicReportGenerators {
  static async generateResidentAnnualFinancialSummary(dateRange?: DateRange) {
    const residents = await DataFetchers.getResidents();
    if (!residents || residents.length === 0) return [];

    const transactions = await DataFetchers.getFinancialTransactions(dateRange);

    return residents.map(resident => {
      const residentTransactions = (transactions || []).filter(t => t.resident_id === resident.id);
      const totalIncome = residentTransactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = residentTransactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        ...resident,
        transactionCount: residentTransactions.length,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses
      };
    });
  }

  static async generateNursingHomeAnnualFinancialSummary(dateRange?: DateRange) {
    const nursingHomes = await DataFetchers.getNursingHomes();
    if (!nursingHomes || nursingHomes.length === 0) return [];

    const transactions = await DataFetchers.getFinancialTransactions(dateRange);

    return nursingHomes.map(nh => {
      const nhTransactions = (transactions || []).filter(t => t.nursing_home_id === nh.id);
      const totalIncome = nhTransactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = nhTransactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        ...nh,
        transactionCount: nhTransactions.length,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses
      };
    });
  }
}
