
import { MonthlyIncomeReportItem, IncomeExpenseSummaryReportItem } from '@/types/reportTypes';
import { NursingHomeExpenseSummaryItem } from './nursingHomeExpenseReport';

export class SummaryCalculators {
  static calculateFinancialSummary(transactions: any[]) {
    const totalTransactions = transactions.length;
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalTransactions,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
    };
  }

  static calculateResidentSummary(residents: any[]) {
    return {
      totalResidents: residents.length,
      activeResidents: residents.filter(r => r.status === 'active').length,
      nursingHomes: [...new Set(residents.map(r => r.nursing_home_id))].length,
    };
  }

  static calculateResidentAnnualFinancialSummary(data: any[]) {
    return {
      totalRecords: data.length,
      reportGenerated: new Date().toISOString(),
    };
  }

  static calculateNursingHomeAnnualFinancialSummary(data: any[]) {
    return {
      totalRecords: data.length,
      reportGenerated: new Date().toISOString(),
    };
  }

  static calculateResidentsIncomePerNursingHomeMonthly(data: MonthlyIncomeReportItem[]) {
    const totalIncome = data.reduce((sum, item) => sum + item.totalIncome, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.totalTransactions, 0);
    const nursingHomesCount = new Set(data.map(item => item.nursingHomeId)).size;
    const monthsCount = new Set(data.map(item => item.monthSort)).size;

    return {
      totalIncome,
      totalTransactions,
      nursingHomesCount,
      monthsCount,
      averageIncomePerMonth: monthsCount > 0 ? totalIncome / monthsCount : 0,
      averageIncomePerNursingHome: nursingHomesCount > 0 ? totalIncome / nursingHomesCount : 0,
    };
  }

  static calculateResidentIncomeExpenseSummary(data: IncomeExpenseSummaryReportItem[]) {
    const totalIncome = data.reduce((sum, item) => sum + item.totalIncome, 0);
    const totalExpenses = data.reduce((sum, item) => sum + item.totalExpenses, 0);
    const netAmount = totalIncome - totalExpenses;
    const nursingHomesCount = new Set(data.map(item => item.nursingHomeId)).size;
    const monthsCount = new Set(data.map(item => item.monthSort)).size;

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      nursingHomesCount,
      monthsCount,
      averageNetPerMonth: monthsCount > 0 ? netAmount / monthsCount : 0,
    };
  }

  static calculateNursingHomeExpenseSummary(data: NursingHomeExpenseSummaryItem[]) {
    const totalExpenses = data.reduce((sum, item) => sum + item.totalExpenses, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.totalTransactions, 0);
    const nursingHomesCount = new Set(data.map(item => item.nursingHomeId)).size;
    const monthsCount = new Set(data.map(item => item.monthSort)).size;
    
    // Get top categories across all nursing homes
    const categoryTotals = new Map<string, number>();
    data.forEach(item => {
      item.expenseCategories.forEach(category => {
        const current = categoryTotals.get(category.category) || 0;
        categoryTotals.set(category.category, current + category.totalAmount);
      });
    });
    
    const topCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    return {
      totalExpenses,
      totalTransactions,
      nursingHomesCount,
      monthsCount,
      averageExpensesPerMonth: monthsCount > 0 ? totalExpenses / monthsCount : 0,
      averageExpensesPerNursingHome: nursingHomesCount > 0 ? totalExpenses / nursingHomesCount : 0,
      topCategories,
    };
  }
}
