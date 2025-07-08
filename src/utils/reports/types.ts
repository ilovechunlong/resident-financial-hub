
export interface ReportData {
  id: string;
  name: string;
  type: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  data: any[];
  summary?: Record<string, any>;
}

export interface DateRange {
  start?: string;
  end?: string;
}
