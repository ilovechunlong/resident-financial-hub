
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronDownIcon, ChevronRightIcon, AlertTriangleIcon } from 'lucide-react';
import { ResidentDetail, ResidentIncomeExpenseSummary } from '@/types/reportTypes';

interface ResidentDetailsCardProps {
  resident: ResidentDetail | ResidentIncomeExpenseSummary;
  residentKey: string;
  isExpanded: boolean;
  onToggleExpansion: (key: string) => void;
  type: 'income' | 'expense';
  monthSort?: string;
}

export function ResidentDetailsCard({ 
  resident, 
  residentKey, 
  isExpanded, 
  onToggleExpansion, 
  type,
  monthSort 
}: ResidentDetailsCardProps) {
  const isIncomeResident = type === 'income' && 'hasIncomeIssues' in resident;
  const isExpenseResident = type === 'expense' && 'monthlyIncome' in resident;

  return (
    <div className="border rounded p-2">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => onToggleExpansion(residentKey)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? 
            <ChevronDownIcon className="h-4 w-4" /> : 
            <ChevronRightIcon className="h-4 w-4" />
          }
          <span className="font-medium">{resident.residentName}</span>
          {isIncomeResident && resident.hasIncomeIssues && (
            <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
          )}
        </div>
        <div className="flex gap-4 text-sm">
          {isIncomeResident && (
            <>
              <span>${resident.totalIncome.toLocaleString()}</span>
              <span className="text-gray-500">({resident.transactionCount} transactions)</span>
            </>
          )}
          {isExpenseResident && (
            <>
              <span className="text-green-600">+${resident.monthlyIncome.toLocaleString()}</span>
              <span className="text-red-600">-${resident.totalExpenses.toLocaleString()}</span>
              <span className={`font-semibold ${resident.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${resident.netAmount.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>

      {isIncomeResident && resident.hasIncomeIssues && (
        <div className="mt-2 p-2 bg-orange-50 rounded text-sm">
          <span className="font-medium text-orange-700">Missing Income Types: </span>
          <span className="text-orange-600">{resident.missingIncomeTypes.join(', ')}</span>
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {isIncomeResident && (
            <>
              <div className="text-xs text-gray-600 mb-2">
                <strong>Expected Income Types:</strong> {resident.expectedIncomeTypes.join(', ') || 'None specified'}
              </div>
              
              {resident.actualTransactions && resident.actualTransactions.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">Individual Transactions:</div>
                  {resident.actualTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 p-2 rounded text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{format(new Date(transaction.date), 'MMM dd, yyyy')}</div>
                          <div className="text-gray-600">{transaction.category}</div>
                          {transaction.description && (
                            <div className="text-gray-500 text-xs">{transaction.description}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${transaction.amount.toLocaleString()}</div>
                          {transaction.paymentMethod && (
                            <div className="text-gray-500 text-xs">{transaction.paymentMethod}</div>
                          )}
                          {transaction.status && (
                            <div className={`text-xs ${transaction.status === 'pending' ? 'text-orange-600' : 'text-green-600'}`}>
                              {transaction.status === 'pending' ? 'PENDING' : 'COMPLETED'}
                            </div>
                          )}
                        </div>
                      </div>
                      {transaction.referenceNumber && (
                        <div className="text-gray-400 text-xs mt-1">Ref: {transaction.referenceNumber}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-red-50 p-2 rounded text-xs text-red-700">
                  <strong>No transactions found</strong> - Expected income types may be missing
                </div>
              )}
            </>
          )}

          {isExpenseResident && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-xs font-medium text-green-700 mb-1">Monthly Income</div>
                  <div className="text-sm font-semibold text-green-600">
                    ${resident.monthlyIncome.toLocaleString()}
                  </div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <div className="text-xs font-medium text-red-700 mb-1">Total Expenses</div>
                  <div className="text-sm font-semibold text-red-600">
                    ${resident.totalExpenses.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {resident.monthlyExpenses && resident.monthlyExpenses.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">Expense Categories:</div>
                  {resident.monthlyExpenses.map((category, catIndex) => (
                    <div key={catIndex} className="bg-gray-50 p-2 rounded text-xs">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-gray-600">{category.transactionCount} transactions</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-red-600">${category.totalAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                  No expenses for this month
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
