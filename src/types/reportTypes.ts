
export interface ResidentTransaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  paymentMethod?: string;
  referenceNumber?: string;
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
