
export interface ReportConfiguration {
  id: string;
  name: string;
  report_type: 'financial_summary' | 'transaction_report' | 'nursing_home_report' | 'resident_report' | 'resident_annual_financial_summary' | 'nursing_home_annual_financial_summary' | 'residents_income_per_nursing_home_monthly' | 'resident_income_expense_by_month_category';
  filters: Record<string, any>;
  date_range_start: string | null;
  date_range_end: string | null;
  nursing_home_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratedReport {
  id: string;
  configuration_id: string;
  report_data: Record<string, any>;
  generated_at: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface ReportFormData {
  name: string;
  report_type: 'financial_summary' | 'transaction_report' | 'nursing_home_report' | 'resident_report' | 'resident_annual_financial_summary' | 'nursing_home_annual_financial_summary' | 'residents_income_per_nursing_home_monthly' | 'resident_income_expense_by_month_category';
  filters?: Record<string, any>;
  date_range_start?: string;
  date_range_end?: string;
  nursing_home_id?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
