
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ResidentDetailsCard } from './ResidentDetailsCard';
import { MonthlyIncomeReportItem, IncomeExpenseSummaryReportItem } from '@/types/reportTypes';
import { NursingHomeExpenseSummaryItem } from '@/utils/reports/nursingHomeExpenseReport';

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

  if (reportType === 'nursing_home_expense_summary') {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">Nursing Home Expense Summary Report Preview</h4>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reportData.data?.map((item: NursingHomeExpenseSummaryItem, index: number) => (
            <div key={`${item.nursingHomeId}-${item.monthSort}`} className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-lg">{item.nursingHomeName}</h5>
                <Badge variant="outline">{item.month}</Badge>
              </div>
              
              <div className="mb-3 p-2 bg-red-50 rounded grid grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="font-medium">Total Expenses:</span>
                  <div className="font-semibold text-red-600">${item.totalExpenses.toLocaleString()}</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Total Transactions:</span>
                  <div className="font-semibold">{item.totalTransactions}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="font-medium text-sm text-gray-700 mb-2">Expense Categories:</h6>
                {item.expenseCategories?.slice(0, 3).map((category, catIndex) => (
                  <div key={catIndex} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <span className="font-semibold text-red-600">${category.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {category.transactionCount} transactions
                    </div>
                  </div>
                ))}
                {item.expenseCategories && item.expenseCategories.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{item.expenseCategories.length - 3} more categories
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
              
              {/* Income Row */}
              <div className="mb-2 p-2 bg-green-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">Total Income:</span>
                  <div className="font-semibold text-green-600">${item.totalIncome.toLocaleString()}</div>
                </div>
              </div>

              {/* Expenses Row */}
              <div className="mb-2 p-2 bg-red-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">Total Expenses:</span>
                  <div className="font-semibold text-red-600">${item.totalExpenses.toLocaleString()}</div>
                </div>
              </div>

              {/* Net Amount Row */}
              <div className="mb-3 p-2 bg-blue-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">Net Amount:</span>
                  <div className={`font-semibold ${item.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${item.netAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="font-medium text-sm text-gray-700 mb-2">Resident Summaries:</h6>
                {item.residentSummaries?.slice(0, 2).map((resident) => {
                  const residentKey = `${resident.residentId}-${item.monthSort}`;
                  return (
                    <div key={resident.residentId} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{resident.residentName}</span>
                        <span className={`font-semibold ${resident.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Net: ${resident.netAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>Income: ${resident.monthlyIncome.toLocaleString()}</div>
                        <div>Expenses: ${resident.totalExpenses.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
                {item.residentSummaries && item.residentSummaries.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{item.residentSummaries.length - 2} more residents
                  </div>
                )}
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
