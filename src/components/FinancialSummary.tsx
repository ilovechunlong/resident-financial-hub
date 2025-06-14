
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialTransactions } from '@/hooks/useFinancialTransactions';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export function FinancialSummary() {
  const { data: transactions = [] } = useFinancialTransactions();

  const calculateTotals = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const totals = transactions.reduce(
      (acc, transaction) => {
        const transactionDate = new Date(transaction.transaction_date);
        const amount = transaction.amount;

        // Overall totals
        if (transaction.transaction_type === 'income') {
          acc.totalIncome += amount;
        } else {
          acc.totalExpenses += amount;
        }

        // Current month totals
        if (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        ) {
          if (transaction.transaction_type === 'income') {
            acc.monthlyIncome += amount;
          } else {
            acc.monthlyExpenses += amount;
          }
        }

        return acc;
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
      }
    );

    return {
      ...totals,
      netTotal: totals.totalIncome - totals.totalExpenses,
      monthlyNet: totals.monthlyIncome - totals.monthlyExpenses,
    };
  };

  const {
    totalIncome,
    totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    netTotal,
    monthlyNet,
  } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getNetColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            All time income
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            All time expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getNetColor(netTotal)}`}>
            {formatCurrency(netTotal)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total income minus expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getNetColor(monthlyNet)}`}>
            {formatCurrency(monthlyNet)}
          </div>
          <p className="text-xs text-muted-foreground">
            Income: {formatCurrency(monthlyIncome)} | Expenses: {formatCurrency(monthlyExpenses)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
