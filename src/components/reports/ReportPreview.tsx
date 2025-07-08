
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ResidentDetailsCard } from './ResidentDetailsCard';
import { MonthlyIncomeReportItem, IncomeExpenseSummaryReportItem } from '@/types/reportTypes';

interface ReportPreviewProps {
  report: any;
  isExpanded: boolean;
  expandedResidents: Set<string>;
  onToggleResidentExpansion: (key: string) => void;
}

export function ReportPreview({ 
  report, 
  isExpanded, 
  expandedResidents, 
  onToggleResidentExpansion 
}: ReportPreviewProps) {
  if (!isExpanded || report.status !== 'completed') return null;

  const reportData = report.report_data;
  const reportType = reportData.report_type;

  if (reportType === 'resident_income_expense_summary') {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">Income Expense Summary Report Preview</h4>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reportData.data?.map((item: IncomeExpenseSummaryReportItem, index: number) => (
            <div key={`${item.nursingHomeId}-${item.monthSort}`} className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-lg">{item.nursingHomeName}</h5>
                <Badge variant="outline">{item.month}</Badge>
              </div>
              
              <div className="mb-3 p-2 bg-blue-50 rounded grid grid-cols-3 gap-4">
                <div className="text-sm">
                  <span className="font-medium">Total Income:</span>
                  <div className="font-semibold text-green-600">${item.totalIncome.toLocaleString()}</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total Expenses:</span>
                  <div className="font-semibold text-red-600">${item.totalExpenses.toLocaleString()}</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Net Amount:</span>
                  <div className={`font-semibold ${item.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${item.netAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="font-medium text-sm text-gray-700 mb-2">Resident Summaries:</h6>
                {item.residentSummaries?.map((resident) => {
                  const residentKey = `${resident.residentId}-${item.monthSort}`;
                  return (
                    <ResidentDetailsCard
                      key={resident.residentId}
                      resident={resident}
                      residentKey={residentKey}
                      isExpanded={expandedResidents.has(residentKey)}
                      onToggleExpansion={onToggleResidentExpansion}
                      type="expense"
                      monthSort={item.monthSort}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reportType === 'residents_income_per_nursing_home_monthly') {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">Detailed Report Preview</h4>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reportData.data?.map((item: MonthlyIncomeReportItem, index: number) => (
            <div key={`${item.nursingHomeId}-${item.monthSort}`} className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-lg">{item.nursingHomeName}</h5>
                <Badge variant="outline">{item.month}</Badge>
              </div>
              
              <div className="mb-3 p-2 bg-blue-50 rounded">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Monthly Total:</span>
                  <span className="font-semibold">${item.totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Transactions:</span>
                  <span>{item.totalTransactions}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="font-medium text-sm text-gray-700 mb-2">Resident Details:</h6>
                {item.residentDetails?.map((resident) => {
                  const residentKey = `${resident.residentId}-${item.monthSort}`;
                  return (
                    <ResidentDetailsCard
                      key={resident.residentId}
                      resident={resident}
                      residentKey={residentKey}
                      isExpanded={expandedResidents.has(residentKey)}
                      onToggleExpansion={onToggleResidentExpansion}
                      type="income"
                      monthSort={item.monthSort}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default preview for other report types
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold mb-2">Report Preview</h4>
      <div className="text-sm text-gray-600">
        <p>Total Records: {reportData.total_records || 'N/A'}</p>
        <p>Generated: {format(new Date(reportData.generated_at), 'MMM dd, yyyy HH:mm')}</p>
      </div>
    </div>
  );
}
