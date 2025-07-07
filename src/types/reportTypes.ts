
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

export interface CategorySummary {
  category: string;
  totalAmount: number;
  transactionCount: number;
  transactions: ResidentTransaction[];
}

export interface MonthlyFinancialData {
  month: string;
  monthSort: string;
  income: CategorySummary[];
  expenses: CategorySummary[];
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export interface ResidentFinancialByMonth {
  residentId: string;
  residentName: string;
  monthlyData: MonthlyFinancialData[];
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export interface NursingHomeFinancialByMonth {
  nursingHomeId: string;
  nursingHomeName: string;
  dateRange: {
    start: string;
    end: string;
  };
  residents: ResidentFinancialByMonth[];
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}
