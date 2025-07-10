
import { ReportData } from './reports/types';
import { DataFetchers } from './reports/dataFetchers';
import { SummaryCalculators } from './reports/summaryCalculators';
import { MonthlyIncomeReportGenerator } from './reports/monthlyIncomeReport';
import { IncomeExpenseReportGenerator } from './reports/incomeExpenseReport';
import { BasicReportGenerators } from './reports/basicReports';
import { ReportExporter } from './reports/exportUtils';

export type { ReportData } from './reports/types';

export class ReportGenerator {
  static async generateReportData(configId: string, reportType: string, dateRange?: { start?: string; end?: string }): Promise<ReportData> {
    console.log('Generating report data for:', { configId, reportType, dateRange });
    
    let data: any[] = [];
    let summary: Record<string, any> = {};
    
    try {
      // Get the configuration to access nursing_home_id filter
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: config } = await supabase
        .from('report_configurations')
        .select('nursing_home_id')
        .eq('id', configId)
        .single();
      
      const nursingHomeId = config?.nursing_home_id;
      
      switch (reportType) {
        case 'transaction_report':
          data = await DataFetchers.getFinancialTransactions(dateRange, nursingHomeId);
          summary = SummaryCalculators.calculateFinancialSummary(data);
          break;
        case 'resident_report':
          data = await DataFetchers.getResidents(nursingHomeId);
          summary = SummaryCalculators.calculateResidentSummary(data);
          break;
        case 'residents_income_per_nursing_home_monthly':
          data = await MonthlyIncomeReportGenerator.generateData(dateRange, configId);
          summary = SummaryCalculators.calculateResidentsIncomePerNursingHomeMonthly(data);
          break;
        case 'resident_income_expense_summary':
          data = await IncomeExpenseReportGenerator.generateData(dateRange, configId);
          summary = SummaryCalculators.calculateResidentIncomeExpenseSummary(data);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
      
      return {
        id: configId,
        name: reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: reportType,
        dateRange,
        data,
        summary
      };
    } catch (error) {
      console.error('Error generating report data:', error);
      throw error;
    }
  }

  static generatePDF(reportData: ReportData): void {
    ReportExporter.generatePDF(reportData);
  }

  static generateExcel(reportData: ReportData): void {
    ReportExporter.generateExcel(reportData);
  }
}
