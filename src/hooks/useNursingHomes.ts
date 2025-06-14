
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NursingHome, NursingHomeFormData } from '@/types/nursingHome';
import { useToast } from '@/hooks/use-toast';

export function useNursingHomes() {
  const [nursingHomes, setNursingHomes] = useState<NursingHome[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNursingHomes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('nursing_homes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching nursing homes:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch nursing homes',
          variant: 'destructive',
        });
        return;
      }

      setNursingHomes((data as NursingHome[]) || []);
      console.log('Fetched nursing homes:', data);
    } catch (error) {
      console.error('Error in fetchNursingHomes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch nursing homes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNursingHomes();
  }, [fetchNursingHomes]);

  const addNursingHome = useCallback(async (data: NursingHomeFormData) => {
    try {
      const { data: newHome, error } = await supabase
        .from('nursing_homes')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error adding nursing home:', error);
        toast({
          title: 'Error',
          description: 'Failed to add nursing home',
          variant: 'destructive',
        });
        return;
      }

      setNursingHomes(prev => [newHome as NursingHome, ...prev]);
      toast({
        title: 'Success',
        description: 'Nursing home added successfully',
      });
      console.log('Added nursing home:', newHome);
    } catch (error) {
      console.error('Error in addNursingHome:', error);
      toast({
        title: 'Error',
        description: 'Failed to add nursing home',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const updateNursingHome = useCallback(async (id: string, data: NursingHomeFormData) => {
    try {
      const { data: updatedHome, error } = await supabase
        .from('nursing_homes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating nursing home:', error);
        toast({
          title: 'Error',
          description: 'Failed to update nursing home',
          variant: 'destructive',
        });
        return;
      }

      setNursingHomes(prev => prev.map(home => 
        home.id === id ? updatedHome as NursingHome : home
      ));
      toast({
        title: 'Success',
        description: 'Nursing home updated successfully',
      });
      console.log('Updated nursing home:', updatedHome);
    } catch (error) {
      console.error('Error in updateNursingHome:', error);
      toast({
        title: 'Error',
        description: 'Failed to update nursing home',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteNursingHome = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('nursing_homes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting nursing home:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete nursing home',
          variant: 'destructive',
        });
        return;
      }

      setNursingHomes(prev => prev.filter(home => home.id !== id));
      toast({
        title: 'Success',
        description: 'Nursing home deleted successfully',
      });
      console.log('Deleted nursing home:', id);
    } catch (error) {
      console.error('Error in deleteNursingHome:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete nursing home',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    nursingHomes,
    loading,
    addNursingHome,
    updateNursingHome,
    deleteNursingHome,
    refetch: fetchNursingHomes,
  };
}
