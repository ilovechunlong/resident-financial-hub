import { supabase } from '@/integrations/supabase/client';
import { DateRange } from './types';

export class DataFetchers {
  static async getFinancialTransactions(dateRange?: DateRange, nursingHomeId?: string) {
    let query = supabase
      .from('financial_transactions')
      .select(`*, residents:resident_id (first_name, last_name, nursing_home_id, nursing_homes (name)), nursing_homes:nursing_home_id (name)`)
      .eq('status', 'completed');

    if (dateRange?.start) {
      query = query.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte('transaction_date', dateRange.end);
    }
    if (nursingHomeId) {
      query = query.eq('nursing_home_id', nursingHomeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    // Map resident and nursing home names for each transaction
    return (data || []).map((tx: any) => ({
      ...tx,
      resident_name: tx.residents ? `${tx.residents.first_name} ${tx.residents.last_name}` : '-',
      nursing_home_name: tx.nursing_homes ? tx.nursing_homes.name : (tx.residents?.nursing_homes?.name || '-')
    }));
  }

  static async getNursingHomes() {
    const { data, error } = await supabase
      .from('nursing_homes')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  static async getResidents(nursingHomeId?: string | null) {
    let query = supabase
      .from('residents')
      .select(`
        *,
        nursing_homes (
          id,
          name
        )
      `);
    
    // Apply nursing home filter if provided
    if (nursingHomeId) {
      query = query.eq('nursing_home_id', nursingHomeId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getResidentsWithNursingHome(nursingHomeId?: string | null) {
    let query = supabase
      .from('residents')
      .select(`
        id,
        first_name,
        last_name,
        nursing_home_id,
        income_types,
        nursing_homes (
          id,
          name
        )
      `)
      .not('nursing_home_id', 'is', null);

    if (nursingHomeId) {
      query = query.eq('nursing_home_id', nursingHomeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getIncomeTransactions(residentIds: string[], dateRange?: DateRange) {
    let query = supabase
      .from('financial_transactions')
      .select('*')
      .eq('transaction_type', 'income')
      .not('resident_id', 'is', null)
      .in('resident_id', residentIds)
      .eq('status', 'completed');

    if (dateRange?.start) {
      query = query.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte('transaction_date', dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getAllTransactions(residentIds: string[], dateRange?: DateRange) {
    let query = supabase
      .from('financial_transactions')
      .select('*')
      .in('transaction_type', ['income', 'expense'])
      .not('resident_id', 'is', null)
      .in('resident_id', residentIds)
      .eq('status', 'completed');

    if (dateRange?.start) {
      query = query.gte('transaction_date', dateRange.start);
    }
    if (dateRange?.end) {
      query = query.lte('transaction_date', dateRange.end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}
