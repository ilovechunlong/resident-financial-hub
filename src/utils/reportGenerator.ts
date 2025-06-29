import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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
          data = await this.getResidentsIncomePerNursingHomeMonthlyData(dateRange);
          summary = this.calculateResidentsIncomePerNursingHomeMonthly(data);
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

  private static async getResidentsIncomePerNursingHomeMonthlyData(dateRange?: { start?: string; end?: string }) {
    // Fetch transactions with nursing home and resident data
    let transactionQuery = supabase
      .from('financial_transactions')
      .select(`
        *,
        nursing_homes (
          id,
          name
        ),
        residents (
          id,
          first_name,
          last_name,
          nursing_home_id
        )
      `)
      .eq('transaction_type', 'income')
      .not('nursing_home_id', 'is', null)
      .not('resident_id', 'is', null);

    if (dateRange?.start) {
      transactionQuery = transactionQuery.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      transactionQuery = transactionQuery.lte('transaction_date', dateRange.end);
    }

    const { data: transactions, error: transactionsError } = await transactionQuery;
    if (transactionsError) throw transactionsError;

    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Group transactions by nursing home, month, and resident
    const groupedData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.transaction_date);
      const monthKey = format(date, 'yyyy-MM');
      const nursingHomeId = transaction.nursing_home_id;
      const nursingHomeName = transaction.nursing_homes?.name || 'Unknown';
      const residentId = transaction.resident_id;
      const residentName = transaction.residents ? 
        `${transaction.residents.first_name} ${transaction.residents.last_name}` : 
        'Unknown';
      
      // Create a unique key for each nursing home + month + resident combination
      const key = `${nursingHomeId}-${monthKey}-${residentId}`;
      
      if (!acc[key]) {
        acc[key] = {
          nursingHomeId,
          nursingHomeName,
          month: format(date, 'MMM yyyy'),
          monthSort: monthKey,
          residentId,
          residentName,
          totalIncome: 0,
          transactionCount: 0,
        };
      }
      
      acc[key].totalIncome += Number(transaction.amount);
      acc[key].transactionCount += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array format and sort by nursing home, then month, then resident
    return Object.values(groupedData)
      .sort((a: any, b: any) => {
        // First sort by nursing home name
        if (a.nursingHomeName !== b.nursingHomeName) {
          return a.nursingHomeName.localeCompare(b.nursingHomeName);
        }
        // Then by month
        if (a.monthSort !== b.monthSort) {
          return a.monthSort.localeCompare(b.monthSort);
        }
        // Finally by resident name
        return a.residentName.localeCompare(b.residentName);
      });
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
    const totalResidents = new Set(data.map(d => d.residentId)).size;
    const totalRecords = data.length;
    const totalIncome = data.reduce((sum, d) => sum + d.totalIncome, 0);
    const totalTransactions = data.reduce((sum, d) => sum + d.transactionCount, 0);

    return {
      totalNursingHomes,
      totalResidents,
      totalRecords,
      totalIncome,
      totalTransactions,
      averageIncomePerRecord: totalRecords > 0 ? totalIncome / totalRecords : 0,
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
        return ['Nursing Home', 'Month', 'Resident Name', 'Total Income', 'Transaction Count'];
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
        return data.map(item => [
          item.nursingHomeName,
          item.month,
          item.residentName,
          `$${item.totalIncome.toLocaleString()}`,
          item.transactionCount.toString()
        ]);
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
          3: { halign: 'right' }, // Total Income
          4: { halign: 'right' }, // Transaction Count
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
        return data.map(item => ({
          'Nursing Home': item.nursingHomeName,
          'Month': item.month,
          'Resident Name': item.residentName,
          'Total Income': item.totalIncome,
          'Transaction Count': item.transactionCount,
        }));
      default:
        return data;
    }
  }
}
