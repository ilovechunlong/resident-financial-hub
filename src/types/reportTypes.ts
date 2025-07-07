
export interface ResidentTransaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  status?: string;
}

export interface ResidentDetail {
  residentId: string;
  residentName: string;
  expectedIncomeTypes: string[];
  totalIncome: number;
  transactionCount: number;
  hasIncomeIssues: boolean;
  missingIncomeTypes: string[];
  actualTransactions: ResidentTransaction[];
}

export interface MonthlyIncomeReportItem {
  nursingHomeId: string;
  nursingHomeName: string;
  month: string;
  monthSort: string;
  totalIncome: number;
  totalTransactions: number;
  residentDetails: ResidentDetail[];
}

export interface MonthlyExpenseCategory {
  category: string;
  totalAmount: number;
  transactionCount: number;
  transactions: ResidentTransaction[];
}

export interface ResidentIncomeExpenseSummary {
  residentId: string;
  residentName: string;
  monthlyIncome: number;
  monthlyExpenses: MonthlyExpenseCategory[];
  totalExpenses: number;
  netAmount: number;
}

export interface IncomeExpenseSummaryReportItem {
  nursingHomeId: string;
  nursingHomeName: string;
  month: string;
  monthSort: string;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  residentSummaries: ResidentIncomeExpenseSummary[];
}
