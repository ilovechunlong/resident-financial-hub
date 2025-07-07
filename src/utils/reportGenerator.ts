import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { ResidentDetail, ResidentTransaction, MonthlyIncomeReportItem } from '@/types/reportTypes';

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
        case 'resident_income_expense_summary':
          data = await this.getResidentIncomeExpenseSummaryData(dateRange, configId);
          summary = this.calculateResidentIncomeExpenseSummary(data);
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

  private static async getResidentIncomeExpenseSummaryData(dateRange?: { start?: string; end?: string }, configId?: string) {
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

    // Get residents filtered by nursing home if specified
    let residentsQuery = supabase
      .from('residents')
      .select(`
        id,
        first_name,
        last_name,
        nursing_home_id,
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

    // Get all transactions (both income and expense) for these residents
    let transactionQuery = supabase
      .from('financial_transactions')
      .select('*')
      .in('transaction_type', ['income', 'expense'])
      .not('resident_id', 'is', null)
      .in('resident_id', residents.map(r => r.id))
      .eq('status', 'completed'); // Only include completed transactions

    if (dateRange?.start) {
      transactionQuery = transactionQuery.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      transactionQuery = transactionQuery.lte('transaction_date', dateRange.end);
    }

    const { data: transactions, error: transactionsError } = await transactionQuery;
    if (transactionsError) throw transactionsError;

    // Create analysis by nursing home and month
    const analysisMap = new Map<string, IncomeExpenseSummaryReportItem>();

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

    // Initialize data structure for each nursing home and month
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

    // Process actual transactions
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
              // Group expenses by category
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

    // Calculate net amounts
    analysisMap.forEach(nhMonthData => {
      nhMonthData.netAmount = nhMonthData.totalIncome - nhMonthData.totalExpenses;
      nhMonthData.residentSummaries.forEach(residentData => {
        residentData.netAmount = residentData.monthlyIncome - residentData.totalExpenses;
        // Sort expense categories by total amount descending
        residentData.monthlyExpenses.sort((a, b) => b.totalAmount - a.totalAmount);
      });
      // Sort residents by net amount descending
      nhMonthData.residentSummaries.sort((a, b) => b.netAmount - a.netAmount);
    });

    // Convert to final structure and sort
    const result = Array.from(analysisMap.values()).sort((a, b) => {
      if (a.nursingHomeName !== b.nursingHomeName) {
        return a.nursingHomeName.localeCompare(b.nursingHomeName);
      }
      return a.monthSort.localeCompare(b.monthSort);
    });

    return result;
  }

  private static calculateResidentIncomeExpenseSummary(data: any[]) {
    const totalNursingHomes = new Set(data.map(d => d.nursingHomeId)).size;
    const totalRecords = data.length;
    const totalIncome = data.reduce((sum, d) => sum + d.totalIncome, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.totalExpenses, 0);
    const netAmount = totalIncome - totalExpenses;
    
    // Calculate total unique residents
    const allResidents = new Set();
    data.forEach(d => {
      d.residentSummaries.forEach((resident: any) => {
        allResidents.add(resident.residentId);
      });
    });

    return {
      totalNursingHomes,
      totalResidents: allResidents.size,
      totalRecords,
      totalIncome,
      totalExpenses,
      netAmount,
      averageIncomePerRecord: totalRecords > 0 ? totalIncome / totalRecords : 0,
      averageExpensePerRecord: totalRecords > 0 ? totalExpenses / totalRecords : 0,
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
      case 'resident_income_expense_summary':
        return ['Nursing Home', 'Month', 'Resident', 'Income', 'Expense Category', 'Expense Amount', 'Net Amount'];
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
      case 'resident_income_expense_summary':
        const expenseRows: any[][] = [];
        data.forEach(item => {
          item.residentSummaries.forEach((resident: any) => {
            if (resident.monthlyExpenses.length > 0) {
              // Add a row for each expense category
              resident.monthlyExpenses.forEach((expense: any) => {
                expenseRows.push([
                  item.nursingHomeName,
                  item.month,
                  resident.residentName,
                  `$${resident.monthlyIncome.toLocaleString()}`,
                  expense.category,
                  `$${expense.totalAmount.toLocaleString()}`,
                  `$${resident.netAmount.toLocaleString()}`
                ]);
              });
            } else {
              // Add a single row if no expenses
              expenseRows.push([
                item.nursingHomeName,
                item.month,
                resident.residentName,
                `$${resident.monthlyIncome.toLocaleString()}`,
                'No Expenses',
                '$0',
                `$${resident.netAmount.toLocaleString()}`
              ]);
            }
          });
        });
        return expenseRows;
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
      case 'resident_income_expense_summary':
        return {
          3: { halign: 'right' }, // Income
          5: { halign: 'right' }, // Expense Amount
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
                  'Missing Income Types': resident.missingIncomeTypes.join(', ',
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
      case 'resident_income_expense_summary':
        const expenseExcelData: any[] = [];
        data.forEach(item => {
          item.residentSummaries.forEach((resident: any) => {
            if (resident.monthlyExpenses.length > 0) {
              // Add a row for each expense category
              resident.monthlyExpenses.forEach((expense: any) => {
                expenseExcelData.push({
                  'Nursing Home': item.nursingHomeName,
                  'Month': item.month,
                  'Resident Name': resident.residentName,
                  'Monthly Income': resident.monthlyIncome,
                  'Expense Category': expense.category,
                  'Expense Amount': expense.totalAmount,
                  'Transaction Count': expense.transactionCount,
                  'Total Expenses': resident.totalExpenses,
                  'Net Amount': resident.netAmount
                });
              });
            } else {
              // Add a single row if no expenses
              expenseExcelData.push({
                'Nursing Home': item.nursingHomeName,
                'Month': item.month,
                'Resident Name': resident.residentName,
                'Monthly Income': resident.monthlyIncome,
                'Expense Category': 'No Expenses',
                'Expense Amount': 0,
                'Transaction Count': 0,
                'Total Expenses': resident.totalExpenses,
                'Net Amount': resident.netAmount
              });
            }
          });
        });
        return expenseExcelData;
      default:
        return data;
    }
  }
}
