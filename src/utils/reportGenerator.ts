import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { ResidentDetail, ResidentTransaction, MonthlyIncomeReportItem, CategorySummary, MonthlyFinancialData, ResidentFinancialByMonth, NursingHomeFinancialByMonth } from '@/types/reportTypes';

export interface ReportData {
  id: string;
  name: string;
  type: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  data: any[];
  summary?: Record<string, any>;
}

export class ReportGenerator {
  static async generateReportData(configId: string, reportType: string, dateRange?: { start?: string; end?: string }): Promise<ReportData> {
    console.log('Generating report data for:', { configId, reportType, dateRange });
    
    let data: any[] = [];
    let summary: Record<string, any> = {};
    
    try {
      switch (reportType) {
        case 'financial_summary':
          data = await this.getFinancialSummaryData(dateRange);
          summary = this.calculateFinancialSummary(data);
          break;
        case 'transaction_report':
          data = await this.getTransactionData(dateRange);
          summary = this.calculateTransactionSummary(data);
          break;
        case 'nursing_home_report':
          data = await this.getNursingHomeData();
          summary = this.calculateNursingHomeSummary(data);
          break;
        case 'resident_report':
          data = await this.getResidentData();
          summary = this.calculateResidentSummary(data);
          break;
        case 'resident_annual_financial_summary':
          data = await this.getResidentAnnualFinancialSummaryData(dateRange);
          summary = this.calculateResidentAnnualFinancialSummary(data);
          break;
        case 'nursing_home_annual_financial_summary':
          data = await this.getNursingHomeAnnualFinancialSummaryData(dateRange);
          summary = this.calculateNursingHomeAnnualFinancialSummary(data);
          break;
        case 'residents_income_per_nursing_home_monthly':
          data = await this.getResidentsIncomePerNursingHomeMonthlyData(dateRange, configId);
          summary = this.calculateResidentsIncomePerNursingHomeMonthly(data);
          break;
        case 'resident_income_expense_by_month_category':
          data = await this.getResidentIncomeExpenseByMonthCategoryData(dateRange, configId);
          summary = this.calculateResidentIncomeExpenseByMonthCategory(data);
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

  private static async getFinancialSummaryData(dateRange?: { start?: string; end?: string }) {
    let query = supabase
      .from('financial_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (dateRange?.start) {
      query = query.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte('transaction_date', dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  private static async getTransactionData(dateRange?: { start?: string; end?: string }) {
    return this.getFinancialSummaryData(dateRange);
  }

  private static async getNursingHomeData() {
    const { data, error } = await supabase
      .from('nursing_homes')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  private static async getResidentData() {
    const { data, error } = await supabase
      .from('residents')
      .select(`
        *,
        nursing_homes (
          name
        )
      `)
      .order('last_name');

    if (error) throw error;
    return data || [];
  }

  private static async getResidentAnnualFinancialSummaryData(dateRange?: { start?: string; end?: string }) {
    let transactionQuery = supabase
      .from('financial_transactions')
      .select('*')
      .in('transaction_type', ['income', 'expense'])
      .not('resident_id', 'is', null);

    if (dateRange?.start) {
      transactionQuery = transactionQuery.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      transactionQuery = transactionQuery.lte('transaction_date', dateRange.end);
    }

    const { data: transactions, error: transactionsError } = await transactionQuery;
    if (transactionsError) throw transactionsError;

    const { data: residents, error: residentsError } = await supabase
      .from('residents')
      .select('id, first_name, last_name');
    if (residentsError) throw residentsError;

    if (!transactions || !residents) {
      return [];
    }

    const transactionsByResident = transactions.reduce((acc, t) => {
      if (t.resident_id) {
        if (!acc[t.resident_id]) {
          acc[t.resident_id] = [];
        }
        acc[t.resident_id].push(t);
      }
      return acc;
    }, {} as Record<string, any[]>);

    return residents.map(resident => {
      const residentTransactions = transactionsByResident[resident.id] || [];
      const totalIncome = residentTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalExpenses = residentTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      return {
        ...resident,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        transactionCount: residentTransactions.length,
      };
    });
  }

  private static async getNursingHomeAnnualFinancialSummaryData(dateRange?: { start?: string; end?: string }) {
    let transactionQuery = supabase
      .from('financial_transactions')
      .select('*')
      .in('transaction_type', ['income', 'expense'])
      .not('nursing_home_id', 'is', null);

    if (dateRange?.start) {
      transactionQuery = transactionQuery.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      transactionQuery = transactionQuery.lte('transaction_date', dateRange.end);
    }

    const { data: transactions, error: transactionsError } = await transactionQuery;
    if (transactionsError) throw transactionsError;

    const { data: nursingHomes, error: nursingHomesError } = await supabase
      .from('nursing_homes')
      .select('id, name');
    if (nursingHomesError) throw nursingHomesError;

    if (!transactions || !nursingHomes) {
      return [];
    }

    const transactionsByNursingHome = transactions.reduce((acc, t) => {
      if (t.nursing_home_id) {
        if (!acc[t.nursing_home_id]) {
          acc[t.nursing_home_id] = [];
        }
        acc[t.nursing_home_id].push(t);
      }
      return acc;
    }, {} as Record<string, any[]>);

    return nursingHomes.map(nh => {
      const nhTransactions = transactionsByNursingHome[nh.id] || [];
      const totalIncome = nhTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalExpenses = nhTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      return {
        ...nh,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
        transactionCount: nhTransactions.length,
      };
    });
  }

  private static async getResidentsIncomePerNursingHomeMonthlyData(dateRange?: { start?: string; end?: string }, configId?: string) {
    // First, get the nursing home ID from the report configuration
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

    // Get residents filtered by nursing home if specified
    let residentsQuery = supabase
      .from('residents')
      .select(`
        id,
        first_name,
        last_name,
        nursing_home_id,
        income_types,
        nursing_homes (
          id,
          name
        )
      `)
      .not('nursing_home_id', 'is', null);

    // Filter by specific nursing home if provided
    if (nursingHomeId) {
      residentsQuery = residentsQuery.eq('nursing_home_id', nursingHomeId);
    }

    const { data: residents, error: residentsError } = await residentsQuery;
    if (residentsError) throw residentsError;
    if (!residents || residents.length === 0) return [];

    // Get all income transactions for these residents
    let transactionQuery = supabase
      .from('financial_transactions')
      .select('*')
      .eq('transaction_type', 'income')
      .not('resident_id', 'is', null)
      .in('resident_id', residents.map(r => r.id));

    if (dateRange?.start) {
      transactionQuery = transactionQuery.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      transactionQuery = transactionQuery.lte('transaction_date', dateRange.end);
    }

    const { data: transactions, error: transactionsError } = await transactionQuery;
    if (transactionsError) throw transactionsError;

    // Create a comprehensive analysis by nursing home and month
    const analysisMap = new Map<string, MonthlyIncomeReportItem>();

    // Generate months in the date range
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

    // Process each nursing home and month combination
    residents.forEach(resident => {
      const residentNursingHomeId = resident.nursing_home_id;
      const nursingHomeName = resident.nursing_homes?.name || 'Unknown';
      const residentName = `${resident.first_name} ${resident.last_name}`;
      const expectedIncomeTypes = resident.income_types || [];

      months.forEach(({ monthKey, monthDisplay }) => {
        const nhMonthKey = `${residentNursingHomeId}-${monthKey}`;
        
        if (!analysisMap.has(nhMonthKey)) {
          analysisMap.set(nhMonthKey, {
            nursingHomeId: residentNursingHomeId,
            nursingHomeName,
            month: monthDisplay,
            monthSort: monthKey,
            totalIncome: 0,
            totalTransactions: 0,
            residentDetails: []
          });
        }

        const nhMonthData = analysisMap.get(nhMonthKey)!;
        
        const existingResident = nhMonthData.residentDetails.find(r => r.residentId === resident.id);
        if (!existingResident) {
          nhMonthData.residentDetails.push({
            residentId: resident.id,
            residentName,
            expectedIncomeTypes,
            actualTransactions: [],
            missingIncomeTypes: [],
            totalIncome: 0,
            transactionCount: 0,
            hasIncomeIssues: false
          });
        }
      });
    });

    // Process actual transactions
    (transactions || []).forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = format(date, 'yyyy-MM');
      const resident = residents.find(r => r.id === transaction.resident_id);
      
      if (resident) {
        const nhMonthKey = `${resident.nursing_home_id}-${monthKey}`;
        const nhMonthData = analysisMap.get(nhMonthKey);
        
        if (nhMonthData) {
          const residentData = nhMonthData.residentDetails.find(r => r.residentId === resident.id);
          if (residentData) {
            const transactionData: ResidentTransaction = {
              id: transaction.id,
              date: transaction.transaction_date,
              amount: Number(transaction.amount),
              category: transaction.category,
              description: transaction.description,
              paymentMethod: transaction.payment_method,
              referenceNumber: transaction.reference_number,
              status: transaction.status // Include the transaction status
            };
            
            residentData.actualTransactions.push(transactionData);
            
            // Only count completed transactions in totals, but still include pending ones in the list
            if (transaction.status === 'completed') {
              residentData.totalIncome += Number(transaction.amount);
              nhMonthData.totalIncome += Number(transaction.amount);
            }
            
            residentData.transactionCount += 1;
            nhMonthData.totalTransactions += 1;
          }
        }
      }
    });

    // Detect missing income types
    analysisMap.forEach(nhMonthData => {
      nhMonthData.residentDetails.forEach(residentData => {
        const actualCategories = residentData.actualTransactions.map(t => t.category.toLowerCase());
        const expectedTypes = residentData.expectedIncomeTypes.map((type: string) => type.toLowerCase());
        
        residentData.missingIncomeTypes = expectedTypes.filter(
          expectedType => !actualCategories.some(category => 
            category.includes(expectedType) || expectedType.includes(category)
          )
        );
        
        residentData.hasIncomeIssues = residentData.missingIncomeTypes.length > 0;
      });
    });

    // Convert to final structure
    const result = Array.from(analysisMap.values()).map(nhMonth => ({
      nursingHomeId: nhMonth.nursingHomeId,
      nursingHomeName: nhMonth.nursingHomeName,
      month: nhMonth.month,
      monthSort: nhMonth.monthSort,
      totalIncome: nhMonth.totalIncome,
      totalTransactions: nhMonth.totalTransactions,
      residentDetails: nhMonth.residentDetails.map(resident => ({
        residentId: resident.residentId,
        residentName: resident.residentName,
        expectedIncomeTypes: resident.expectedIncomeTypes,
        totalIncome: resident.totalIncome,
        transactionCount: resident.transactionCount,
        hasIncomeIssues: resident.hasIncomeIssues,
        missingIncomeTypes: resident.missingIncomeTypes,
        transactions: resident.actualTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }))
    }));

    // Sort by nursing home name, then by month
    return result.sort((a, b) => {
      if (a.nursingHomeName !== b.nursingHomeName) {
        return a.nursingHomeName.localeCompare(b.nursingHomeName);
      }
      return a.monthSort.localeCompare(b.monthSort);
    });
  }

  private static async getResidentIncomeExpenseByMonthCategoryData(dateRange?: { start?: string; end?: string }, configId?: string): Promise<NursingHomeFinancialByMonth[]> {
    // Get the nursing home ID from the report configuration
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

    if (!nursingHomeId) {
      throw new Error('Nursing home ID is required for this report type');
    }

    // Get nursing home details
    const { data: nursingHome, error: nursingHomeError } = await supabase
      .from('nursing_homes')
      .select('id, name')
      .eq('id', nursingHomeId)
      .single();

    if (nursingHomeError) throw nursingHomeError;
    if (!nursingHome) throw new Error('Nursing home not found');

    // Get residents for the specified nursing home
    const { data: residents, error: residentsError } = await supabase
      .from('residents')
      .select('id, first_name, last_name')
      .eq('nursing_home_id', nursingHomeId);

    if (residentsError) throw residentsError;
    if (!residents || residents.length === 0) {
      return [{
        nursingHomeId,
        nursingHomeName: nursingHome.name,
        dateRange: {
          start: dateRange?.start || '',
          end: dateRange?.end || ''
        },
        residents: [],
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0
      }];
    }

    // Get all transactions for these residents within the date range
    let transactionQuery = supabase
      .from('financial_transactions')
      .select('*')
      .in('resident_id', residents.map(r => r.id))
      .in('transaction_type', ['income', 'expense']);

    if (dateRange?.start) {
      transactionQuery = transactionQuery.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      transactionQuery = transactionQuery.lte('transaction_date', dateRange.end);
    }

    const { data: transactions, error: transactionsError } = await transactionQuery;
    if (transactionsError) throw transactionsError;

    // Generate months in the date range
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

    // Process data for each resident
    const residentsData: ResidentFinancialByMonth[] = residents.map(resident => {
      const residentTransactions = (transactions || []).filter(t => t.resident_id === resident.id);
      
      // Group transactions by month and category
      const monthlyData: MonthlyFinancialData[] = months.map(({ monthKey, monthDisplay }) => {
        const monthTransactions = residentTransactions.filter(t => {
          const transactionMonth = format(new Date(t.transaction_date), 'yyyy-MM');
          return transactionMonth === monthKey;
        });

        // Group by transaction type and category
        const incomeByCategory = new Map<string, CategorySummary>();
        const expensesByCategory = new Map<string, CategorySummary>();

        monthTransactions.forEach(transaction => {
          const categoryMap = transaction.transaction_type === 'income' ? incomeByCategory : expensesByCategory;
          const category = transaction.category;

          if (!categoryMap.has(category)) {
            categoryMap.set(category, {
              category,
              totalAmount: 0,
              transactionCount: 0,
              transactions: []
            });
          }

          const categorySummary = categoryMap.get(category)!;
          categorySummary.totalAmount += Number(transaction.amount);
          categorySummary.transactionCount += 1;
          categorySummary.transactions.push({
            id: transaction.id,
            date: transaction.transaction_date,
            amount: Number(transaction.amount),
            category: transaction.category,
            description: transaction.description,
            paymentMethod: transaction.payment_method,
            referenceNumber: transaction.reference_number,
            status: transaction.status
          });
        });

        const income = Array.from(incomeByCategory.values());
        const expenses = Array.from(expensesByCategory.values());
        const totalIncome = income.reduce((sum, cat) => sum + cat.totalAmount, 0);
        const totalExpenses = expenses.reduce((sum, cat) => sum + cat.totalAmount, 0);

        return {
          month: monthDisplay,
          monthSort: monthKey,
          income,
          expenses,
          totalIncome,
          totalExpenses,
          netAmount: totalIncome - totalExpenses
        };
      });

      const totalIncome = monthlyData.reduce((sum, month) => sum + month.totalIncome, 0);
      const totalExpenses = monthlyData.reduce((sum, month) => sum + month.totalExpenses, 0);

      return {
        residentId: resident.id,
        residentName: `${resident.first_name} ${resident.last_name}`,
        monthlyData,
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses
      };
    });

    const totalIncome = residentsData.reduce((sum, resident) => sum + resident.totalIncome, 0);
    const totalExpenses = residentsData.reduce((sum, resident) => sum + resident.totalExpenses, 0);

    return [{
      nursingHomeId,
      nursingHomeName: nursingHome.name,
      dateRange: {
        start: dateRange?.start || '',
        end: dateRange?.end || ''
      },
      residents: residentsData,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses
    }];
  }

  private static calculateFinancialSummary(data: any[]) {
    const totalIncome = data
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = data
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      totalTransactions: data.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      generatedAt: new Date().toISOString()
    };
  }

  private static calculateTransactionSummary(data: any[]) {
    return this.calculateFinancialSummary(data);
  }

  private static calculateNursingHomeSummary(data: any[]) {
    const totalCapacity = data.reduce((sum, nh) => sum + (nh.capacity || 0), 0);
    const totalResidents = data.reduce((sum, nh) => sum + (nh.current_residents || 0), 0);
    const occupancyRate = totalCapacity > 0 ? (totalResidents / totalCapacity) * 100 : 0;

    return {
      totalNursingHomes: data.length,
      totalCapacity,
      totalResidents,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      generatedAt: new Date().toISOString()
    };
  }

  private static calculateResidentSummary(data: any[]) {
    const activeCareLevel = data.reduce((acc, resident) => {
      acc[resident.care_level] = (acc[resident.care_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResidents: data.length,
      careLevelBreakdown: activeCareLevel,
      generatedAt: new Date().toISOString()
    };
  }

  private static calculateResidentAnnualFinancialSummary(data: any[]) {
    return {
      totalResidents: data.length,
      generatedAt: new Date().toISOString()
    };
  }

  private static calculateNursingHomeAnnualFinancialSummary(data: any[]) {
    return {
      totalNursingHomes: data.length,
      generatedAt: new Date().toISOString()
    };
  }

  private static calculateResidentsIncomePerNursingHomeMonthly(data: any[]) {
    const totalNursingHomes = new Set(data.map(d => d.nursingHomeId)).size;
    const totalRecords = data.length;
    const totalIncome = data.reduce((sum, d) => sum + d.totalIncome, 0);
    const totalTransactions = data.reduce((sum, d) => sum + d.totalTransactions, 0);
    
    // Calculate total unique residents and residents with issues
    const allResidents = new Set();
    let residentsWithIssues = 0;
    let totalMissingIncomeInstances = 0;

    data.forEach(d => {
      d.residentDetails.forEach((resident: any) => {
        allResidents.add(resident.residentId);
        if (resident.hasIncomeIssues) {
          residentsWithIssues++;
          totalMissingIncomeInstances += resident.missingIncomeTypes.length;
        }
      });
    });

    return {
      totalNursingHomes,
      totalResidents: allResidents.size,
      totalRecords,
      totalIncome,
      totalTransactions,
      residentsWithIssues,
      totalMissingIncomeInstances,
      averageIncomePerRecord: totalRecords > 0 ? totalIncome / totalRecords : 0,
      generatedAt: new Date().toISOString()
    };
  }

  private static calculateResidentIncomeExpenseByMonthCategory(data: NursingHomeFinancialByMonth[]) {
    const nursingHomeData = data[0];
    if (!nursingHomeData) {
      return {
        totalResidents: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        monthsCovered: 0,
        generatedAt: new Date().toISOString()
      };
    }

    const totalResidents = nursingHomeData.residents.length;
    const monthsCovered = nursingHomeData.residents.length > 0 
      ? nursingHomeData.residents[0].monthlyData.length 
      : 0;

    return {
      totalResidents,
      totalIncome: nursingHomeData.totalIncome,
      totalExpenses: nursingHomeData.totalExpenses,
      netAmount: nursingHomeData.netAmount,
      monthsCovered,
      averageIncomePerResident: totalResidents > 0 ? nursingHomeData.totalIncome / totalResidents : 0,
      averageExpensesPerResident: totalResidents > 0 ? nursingHomeData.totalExpenses / totalResidents : 0,
      generatedAt: new Date().toISOString()
    };
  }

  static generatePDF(reportData: ReportData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text(reportData.name, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    const generatedDate = format(new Date(), 'MMM dd, yyyy HH:mm');
    doc.text(`Generated: ${generatedDate}`, pageWidth / 2, 30, { align: 'center' });
    
    if (reportData.dateRange?.start || reportData.dateRange?.end) {
      const dateRangeText = `Date Range: ${reportData.dateRange.start || 'Start'} to ${reportData.dateRange.end || 'End'}`;
      doc.text(dateRangeText, pageWidth / 2, 40, { align: 'center' });
    }

    let yPosition = 60;

    // Summary section
    if (reportData.summary) {
      doc.setFontSize(16);
      doc.text('Summary', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      Object.entries(reportData.summary).forEach(([key, value]) => {
        if (key !== 'generatedAt') {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.text(`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`, 20, yPosition);
          yPosition += 8;
        }
      });
      yPosition += 10;
    }

    // Data table
    if (reportData.data.length > 0) {
      const columns = this.getTableColumns(reportData.type);
      const rows = this.getTableRows(reportData.data, reportData.type);

      autoTable(doc, {
        startY: yPosition,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 },
        columnStyles: this.getColumnStyles(reportData.type),
      });
    }

    // Save the PDF
    const fileName = `${reportData.name.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  }

  static generateExcel(reportData: ReportData): void {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    if (reportData.summary) {
      const summaryData = Object.entries(reportData.summary)
        .filter(([key]) => key !== 'generatedAt')
        .map(([key, value]) => ({
          Metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          Value: typeof value === 'number' ? value.toLocaleString() : value
        }));
      
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
    }

    // Data sheet
    if (reportData.data.length > 0) {
      const dataWorksheet = XLSX.utils.json_to_sheet(this.formatDataForExcel(reportData.data, reportData.type));
      XLSX.utils.book_append_sheet(workbook, dataWorksheet, 'Data');
    }

    // Save the Excel file
    const fileName = `${reportData.name.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  private static getTableColumns(reportType: string): string[] {
    switch (reportType) {
      case 'financial_summary':
      case 'transaction_report':
        return ['Date', 'Type', 'Category', 'Amount', 'Description', 'Status'];
      case 'nursing_home_report':
        return ['Name', 'City', 'State', 'Capacity', 'Current Residents', 'Monthly Rate', 'Status'];
      case 'resident_report':
        return ['Name', 'Nursing Home', 'Room', 'Care Level', 'Admission Date', 'Status'];
      case 'resident_annual_financial_summary':
        return ['Resident Name', 'Transactions', 'Total Income', 'Total Expenses', 'Net Amount'];
      case 'nursing_home_annual_financial_summary':
        return ['Nursing Home', 'Transactions', 'Total Income', 'Total Expenses', 'Net Amount'];
      case 'residents_income_per_nursing_home_monthly':
        return ['Nursing Home', 'Month', 'Resident', 'Transaction Date', 'Amount', 'Category', 'Status', 'Issues'];
      case 'resident_income_expense_by_month_category':
        return ['Resident', 'Month', 'Type', 'Category', 'Amount', 'Transactions', 'Net Amount'];
      default:
        return [];
    }
  }

  private static getTableRows(data: any[], reportType: string): any[][] {
    switch (reportType) {
      case 'financial_summary':
      case 'transaction_report':
        return data.map(item => [
          format(new Date(item.transaction_date), 'MMM dd, yyyy'),
          item.transaction_type,
          item.category,
          `$${parseFloat(item.amount).toLocaleString()}`,
          item.description || '-',
          item.status
        ]);
      case 'nursing_home_report':
        return data.map(item => [
          item.name,
          item.city,
          item.state,
          item.capacity.toString(),
          item.current_residents.toString(),
          `$${item.monthly_rate.toLocaleString()}`,
          item.status
        ]);
      case 'resident_report':
        return data.map(item => [
          `${item.first_name} ${item.last_name}`,
          item.nursing_homes?.name || '-',
          item.room_number || '-',
          item.care_level,
          format(new Date(item.admission_date), 'MMM dd, yyyy'),
          item.status
        ]);
      case 'resident_annual_financial_summary':
        return data.map(item => [
          `${item.first_name} ${item.last_name}`,
          item.transactionCount.toString(),
          `$${item.totalIncome.toLocaleString()}`,
          `$${item.totalExpenses.toLocaleString()}`,
          `$${item.netAmount.toLocaleString()}`
        ]);
      case 'nursing_home_annual_financial_summary':
        return data.map(item => [
          item.name,
          item.transactionCount.toString(),
          `$${item.totalIncome.toLocaleString()}`,
          `$${item.totalExpenses.toLocaleString()}`,
          `$${item.netAmount.toLocaleString()}`
        ]);
      case 'residents_income_per_nursing_home_monthly':
        const rows: any[][] = [];
        data.forEach(item => {
          item.residentDetails.forEach((resident: any) => {
            if (resident.transactions.length > 0) {
              // Add individual transaction rows
              resident.transactions.forEach((transaction: any) => {
                rows.push([
                  item.nursingHomeName,
                  item.month,
                  resident.residentName,
                  format(new Date(transaction.date), 'MMM dd, yyyy'),
                  `$${transaction.amount.toLocaleString()}`,
                  transaction.category,
                  transaction.status || 'completed',
                  resident.hasIncomeIssues ? `Missing: ${resident.missingIncomeTypes.join(', ')}` : 'OK'
                ]);
              });
            } else {
              // Add row for residents with no transactions
              rows.push([
                item.nursingHomeName,
                item.month,
                resident.residentName,
                'NO TRANSACTIONS',
                '$0',
                '-',
                '-',
                resident.hasIncomeIssues ? `Missing: ${resident.missingIncomeTypes.join(', ')}` : 'No Expected Income'
              ]);
            }
          });
        });
        return rows;
      case 'resident_income_expense_by_month_category':
        const rows2: any[][] = [];
        data.forEach((nursingHome: NursingHomeFinancialByMonth) => {
          nursingHome.residents.forEach(resident => {
            resident.monthlyData.forEach(monthData => {
              // Add income rows
              monthData.income.forEach(incomeCategory => {
                rows2.push([
                  resident.residentName,
                  monthData.month,
                  'Income',
                  incomeCategory.category,
                  `$${incomeCategory.totalAmount.toLocaleString()}`,
                  incomeCategory.transactionCount.toString(),
                  '-'
                ]);
              });
              
              // Add expense rows
              monthData.expenses.forEach(expenseCategory => {
                rows2.push([
                  resident.residentName,
                  monthData.month,
                  'Expense',
                  expenseCategory.category,
                  `$${expenseCategory.totalAmount.toLocaleString()}`,
                  expenseCategory.transactionCount.toString(),
                  '-'
                ]);
              });

              // Add monthly summary row
              if (monthData.income.length > 0 || monthData.expenses.length > 0) {
                rows2.push([
                  resident.residentName,
                  monthData.month,
                  'MONTHLY NET',
                  '-',
                  '-',
                  '-',
                  `$${monthData.netAmount.toLocaleString()}`
                ]);
              }
            });
          });
        });
        return rows2;
      default:
        return [];
    }
  }

  private static getColumnStyles(reportType: string): Record<string, any> {
    switch (reportType) {
      case 'financial_summary':
      case 'transaction_report':
        return {
          3: { halign: 'right' }, // Amount column
        };
      case 'nursing_home_report':
        return {
          3: { halign: 'right' }, // Capacity
          4: { halign: 'right' }, // Current Residents
          5: { halign: 'right' }, // Monthly Rate
        };
      case 'resident_annual_financial_summary':
        return {
          1: { halign: 'right' }, // Transactions
          2: { halign: 'right' }, // Total Income
          3: { halign: 'right' }, // Total Expenses
          4: { halign: 'right' }, // Net Amount
        };
      case 'nursing_home_annual_financial_summary':
        return {
          1: { halign: 'right' }, // Transactions
          2: { halign: 'right' }, // Total Income
          3: { halign: 'right' }, // Total Expenses
          4: { halign: 'right' }, // Net Amount
        };
      case 'residents_income_per_nursing_home_monthly':
        return {
          4: { halign: 'right' }, // Amount
        };
      case 'resident_income_expense_by_month_category':
        return {
          4: { halign: 'right' }, // Amount
          5: { halign: 'right' }, // Transactions
          6: { halign: 'right' }, // Net Amount
        };
      default:
        return {};
    }
  }

  private static formatDataForExcel(data: any[], reportType: string): any[] {
    switch (reportType) {
      case 'financial_summary':
      case 'transaction_report':
        return data.map(item => ({
          Date: format(new Date(item.transaction_date), 'MMM dd, yyyy'),
          Type: item.transaction_type,
          Category: item.category,
          Amount: parseFloat(item.amount),
          Description: item.description || '',
          Status: item.status,
          'Reference Number': item.reference_number || '',
          'Payment Method': item.payment_method || ''
        }));
      case 'nursing_home_report':
        return data.map(item => ({
          Name: item.name,
          Address: item.address,
          City: item.city,
          State: item.state,
          'Zip Code': item.zip_code,
          'Phone Number': item.phone_number,
          Email: item.email,
          Capacity: item.capacity,
          'Current Residents': item.current_residents,
          'Monthly Rate': item.monthly_rate,
          Status: item.status,
          Administrator: item.administrator,
          'License Number': item.license_number
        }));
      case 'resident_report':
        return data.map(item => ({
          'First Name': item.first_name,
          'Last Name': item.last_name,
          'Date of Birth': format(new Date(item.date_of_birth), 'MMM dd, yyyy'),
          Gender: item.gender,
          'Phone Number': item.phone_number || '',
          'Nursing Home': item.nursing_homes?.name || '',
          'Room Number': item.room_number || '',
          'Care Level': item.care_level,
          'Mobility Level': item.mobility_level,
          'Admission Date': format(new Date(item.admission_date), 'MMM dd, yyyy'),
          Status: item.status,
          'Emergency Contact': item.emergency_contact_name,
          'Emergency Phone': item.emergency_contact_phone,
          'Emergency Relationship': item.emergency_contact_relationship
        }));
      case 'resident_annual_financial_summary':
        return data.map(item => ({
          'Resident Name': `${item.first_name} ${item.last_name}`,
          'Transaction Count': item.transactionCount,
          'Total Income': item.totalIncome,
          'Total Expenses': item.totalExpenses,
          'Net Amount': item.netAmount,
        }));
      case 'nursing_home_annual_financial_summary':
        return data.map(item => ({
          'Nursing Home': item.name,
          'Transaction Count': item.transactionCount,
          'Total Income': item.totalIncome,
          'Total Expenses': item.totalExpenses,
          'Net Amount': item.netAmount,
        }));
      case 'residents_income_per_nursing_home_monthly':
        const excelData: any[] = [];
        data.forEach(item => {
          item.residentDetails.forEach((resident: any) => {
            if (resident.transactions.length > 0) {
              // Add individual transaction rows
              resident.transactions.forEach((transaction: any) => {
                excelData.push({
                  'Nursing Home': item.nursingHomeName,
                  'Month': item.month,
                  'Resident Name': resident.residentName,
                  'Transaction Date': format(new Date(transaction.date), 'MMM dd, yyyy'),
                  'Amount': transaction.amount,
                  'Category': transaction.category,
                  'Description': transaction.description || '',
                  'Payment Method': transaction.paymentMethod || '',
                  'Reference Number': transaction.referenceNumber || '',
                  'Status': transaction.status || 'completed',
                  'Expected Income Types': resident.expectedIncomeTypes.join(', '),
                  'Missing Income Types': resident.missingIncomeTypes.join(', '),
                  'Has Issues': resident.hasIncomeIssues ? 'YES' : 'NO'
                });
              });
            } else {
              // Add row for residents with no transactions
              excelData.push({
                'Nursing Home': item.nursingHomeName,
                'Month': item.month,
                'Resident Name': resident.residentName,
                'Transaction Date': 'NO TRANSACTIONS',
                'Amount': 0,
                'Category': '',
                'Description': '',
                'Payment Method': '',
                'Reference Number': '',
                'Status': '',
                'Expected Income Types': resident.expectedIncomeTypes.join(', '),
                'Missing Income Types': resident.missingIncomeTypes.join(', '),
                'Has Issues': resident.hasIncomeIssues ? 'YES' : 'NO'
              });
            }
          });
        });
        return excelData;
      case 'resident_income_expense_by_month_category':
        const excelData2: any[] = [];
        data.forEach((nursingHome: NursingHomeFinancialByMonth) => {
          nursingHome.residents.forEach(resident => {
            resident.monthlyData.forEach(monthData => {
              // Add income transactions
              monthData.income.forEach(incomeCategory => {
                incomeCategory.transactions.forEach(transaction => {
                  excelData2.push({
                    'Nursing Home': nursingHome.nursingHomeName,
                    'Resident Name': resident.residentName,
                    'Month': monthData.month,
                    'Transaction Type': 'Income',
                    'Category': incomeCategory.category,
                    'Transaction Date': format(new Date(transaction.date), 'MMM dd, yyyy'),
                    'Amount': transaction.amount,
                    'Description': transaction.description || '',
                    'Payment Method': transaction.paymentMethod || '',
                    'Reference Number': transaction.referenceNumber || '',
                    'Status': transaction.status || 'completed'
                  });
                });
              });

              // Add expense transactions
              monthData.expenses.forEach(expenseCategory => {
                expenseCategory.transactions.forEach(transaction => {
                  excelData2.push({
                    'Nursing Home': nursingHome.nursingHomeName,
                    'Resident Name': resident.residentName,
                    'Month': monthData.month,
                    'Transaction Type': 'Expense',
                    'Category': expenseCategory.category,
                    'Transaction Date': format(new Date(transaction.date), 'MMM dd, yyyy'),
                    'Amount': transaction.amount,
                    'Description': transaction.description || '',
                    'Payment Method': transaction.paymentMethod || '',
                    'Reference Number': transaction.referenceNumber || '',
                    'Status': transaction.status || 'completed'
                  });
                });
              });
            });
          });
        });
        return excelData2;
      default:
        return data;
    }
  }
}
