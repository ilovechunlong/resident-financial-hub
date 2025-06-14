
export interface ReportConfiguration {
  id: string;
  name: string;
  report_type: 'financial_summary' | 'transaction_report' | 'nursing_home_report' | 'resident_report';
  filters: Record<string, any>;
  date_range_start: string | null;
  date_range_end: string | null;
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
  report_type: 'financial_summary' | 'transaction_report' | 'nursing_home_report' | 'resident_report';
  filters?: Record<string, any>;
  date_range_start?: string;
  date_range_end?: string;
}
