import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ReportData } from './types';

export class ReportExporter {
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
      case 'transaction_report':
        return ['Date', 'Type', 'Category', 'Nursing Home', 'Resident', 'Amount', 'Description', 'Status'];
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
      case 'transaction_report':
        return data.map(item => [
          format(new Date(item.transaction_date), 'MMM dd, yyyy'),
          item.transaction_type,
          item.category,
          item.nursing_home_name || '-',
          item.resident_name || '-',
          `$${parseFloat(item.amount).toLocaleString()}`,
          item.description || '-',
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
            if (resident.actualTransactions && resident.actualTransactions.length > 0) {
              resident.actualTransactions.forEach((transaction: any) => {
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
      case 'transaction_report':
        return {
          3: { halign: 'right' },
        };
      case 'resident_annual_financial_summary':
        return {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' },
        };
      case 'nursing_home_annual_financial_summary':
        return {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' },
        };
      case 'residents_income_per_nursing_home_monthly':
        return {
          4: { halign: 'right' },
        };
      case 'resident_income_expense_summary':
        return {
          3: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' },
        };
      default:
        return {};
    }
  }

  private static formatDataForExcel(data: any[], reportType: string): any[] {
    switch (reportType) {
      case 'transaction_report':
        return data.map(item => ({
          Date: format(new Date(item.transaction_date), 'MMM dd, yyyy'),
          Type: item.transaction_type,
          Category: item.category,
          'Nursing Home': item.nursing_home_name || '',
          Resident: item.resident_name || '',
          Amount: parseFloat(item.amount),
          Description: item.description || '',
          Status: item.status,
          'Reference Number': item.reference_number || '',
          'Payment Method': item.payment_method || ''
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
            if (resident.actualTransactions && resident.actualTransactions.length > 0) {
              resident.actualTransactions.forEach((transaction: any) => {
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
