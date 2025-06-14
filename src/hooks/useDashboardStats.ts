
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  nursingHomes: number;
  totalResidents: number;
  activeResidents: number;
  monthlyRevenue: number;
  outstandingPayments: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('Fetching dashboard statistics...');
      
      // Fetch nursing homes count
      const { data: nursingHomes, error: nhError } = await supabase
        .from('nursing_homes')
        .select('id')
        .eq('status', 'active');

      if (nhError) {
        console.error('Error fetching nursing homes:', nhError);
        throw nhError;
      }

      // Fetch residents data
      const { data: residents, error: residentsError } = await supabase
        .from('residents')
        .select('id, status');

      if (residentsError) {
        console.error('Error fetching residents:', residentsError);
        throw residentsError;
      }

      // Calculate revenue from financial transactions (current month)
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: monthlyTransactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('amount, transaction_type')
        .eq('status', 'completed')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        throw transactionsError;
      }

      // Calculate outstanding payments (pending transactions)
      const { data: pendingTransactions, error: pendingError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('status', 'pending')
        .eq('transaction_type', 'income');

      if (pendingError) {
        console.error('Error fetching pending transactions:', pendingError);
        throw pendingError;
      }

      // Calculate statistics
      const totalResidents = residents?.length || 0;
      const activeResidents = residents?.filter(r => r.status === 'active').length || 0;
      
      const monthlyRevenue = monthlyTransactions
        ?.filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const outstandingPayments = pendingTransactions
        ?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const stats = {
        nursingHomes: nursingHomes?.length || 0,
        totalResidents,
        activeResidents,
        monthlyRevenue,
        outstandingPayments,
      };

      console.log('Dashboard stats calculated:', stats);
      return stats;
    },
  });
};
