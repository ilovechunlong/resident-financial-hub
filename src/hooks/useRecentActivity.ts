
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface ActivityItem {
  id: string;
  type: 'resident_added' | 'payment_received' | 'expense_logged' | 'report_generated';
  message: string;
  time: string;
  created_at: string;
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<ActivityItem[]> => {
      console.log('Fetching recent activity...');
      
      const activities: ActivityItem[] = [];

      // Fetch recent residents
      const { data: recentResidents, error: residentsError } = await supabase
        .from('residents')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (residentsError) {
        console.error('Error fetching recent residents:', residentsError);
      } else if (recentResidents) {
        recentResidents.forEach(resident => {
          activities.push({
            id: `resident-${resident.id}`,
            type: 'resident_added',
            message: `New resident ${resident.first_name} ${resident.last_name} onboarded`,
            time: format(new Date(resident.created_at), 'PPpp'),
            created_at: resident.created_at,
          });
        });
      }

      // Fetch recent income transactions
      const { data: recentIncomes, error: incomesError } = await supabase
        .from('financial_transactions')
        .select('id, amount, description, created_at')
        .eq('transaction_type', 'income')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(3);

      if (incomesError) {
        console.error('Error fetching recent incomes:', incomesError);
      } else if (recentIncomes) {
        recentIncomes.forEach(income => {
          activities.push({
            id: `income-${income.id}`,
            type: 'payment_received',
            message: `$${Number(income.amount).toLocaleString()} payment received - ${income.description || 'Payment'}`,
            time: format(new Date(income.created_at), 'PPpp'),
            created_at: income.created_at,
          });
        });
      }

      // Fetch recent expense transactions
      const { data: recentExpenses, error: expensesError } = await supabase
        .from('financial_transactions')
        .select('id, amount, description, created_at')
        .eq('transaction_type', 'expense')
        .order('created_at', { ascending: false })
        .limit(2);

      if (expensesError) {
        console.error('Error fetching recent expenses:', expensesError);
      } else if (recentExpenses) {
        recentExpenses.forEach(expense => {
          activities.push({
            id: `expense-${expense.id}`,
            type: 'expense_logged',
            message: `Expense logged: $${Number(expense.amount).toLocaleString()} - ${expense.description || 'Expense'}`,
            time: format(new Date(expense.created_at), 'PPpp'),
            created_at: expense.created_at,
          });
        });
      }

      // Fetch recent reports
      const { data: recentReports, error: reportsError } = await supabase
        .from('generated_reports')
        .select('id, report_data, generated_at')
        .order('generated_at', { ascending: false })
        .limit(2);

      if (reportsError) {
        console.error('Error fetching recent reports:', reportsError);
      } else if (recentReports) {
        recentReports.forEach(report => {
          // Type assertion to safely access report_type
          const reportData = report.report_data as { report_type?: string } | null;
          const reportType = reportData?.report_type || 'Report';
          activities.push({
            id: `report-${report.id}`,
            type: 'report_generated',
            message: `${reportType} report generated`,
            time: format(new Date(report.generated_at), 'PPpp'),
            created_at: report.generated_at,
          });
        });
      }

      // Sort by creation time and limit to 6 most recent
      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
        .map(activity => ({
          ...activity,
          time: format(new Date(activity.created_at), 'p') + ' ago',
        }));

      console.log('Recent activity fetched:', sortedActivities);
      return sortedActivities;
    },
  });
};
