
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Resident, ResidentFormData } from '@/types/resident';
import { useToast } from '@/hooks/use-toast';

export function useResidents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('residents')
        .select(`
          *,
          nursing_homes!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching residents:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch residents',
          variant: 'destructive',
        });
        return;
      }

      setResidents((data as any[])?.map(resident => ({
        ...resident,
        nursing_home_name: resident.nursing_homes?.name
      })) || []);
      console.log('Fetched residents:', data);
    } catch (error) {
      console.error('Error in fetchResidents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch residents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const addResident = useCallback(async (data: ResidentFormData) => {
    try {
      const { data: newResident, error } = await supabase
        .from('residents')
        .insert([data])
        .select(`
          *,
          nursing_homes!inner(name)
        `)
        .single();

      if (error) {
        console.error('Error adding resident:', error);
        toast({
          title: 'Error',
          description: 'Failed to add resident',
          variant: 'destructive',
        });
        return;
      }

      const residentWithHomeName = {
        ...newResident,
        nursing_home_name: newResident.nursing_homes?.name
      };

      setResidents(prev => [residentWithHomeName as any, ...prev]);
      toast({
        title: 'Success',
        description: 'Resident added successfully',
      });
      console.log('Added resident:', newResident);
    } catch (error) {
      console.error('Error in addResident:', error);
      toast({
        title: 'Error',
        description: 'Failed to add resident',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const updateResident = useCallback(async (id: string, data: ResidentFormData) => {
    try {
      const { data: updatedResident, error } = await supabase
        .from('residents')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          nursing_homes!inner(name)
        `)
        .single();

      if (error) {
        console.error('Error updating resident:', error);
        toast({
          title: 'Error',
          description: 'Failed to update resident',
          variant: 'destructive',
        });
        return;
      }

      const residentWithHomeName = {
        ...updatedResident,
        nursing_home_name: updatedResident.nursing_homes?.name
      };

      setResidents(prev => prev.map(resident => 
        resident.id === id ? residentWithHomeName as any : resident
      ));
      toast({
        title: 'Success',
        description: 'Resident updated successfully',
      });
      console.log('Updated resident:', updatedResident);
    } catch (error) {
      console.error('Error in updateResident:', error);
      toast({
        title: 'Error',
        description: 'Failed to update resident',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteResident = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting resident:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete resident',
          variant: 'destructive',
        });
        return;
      }

      setResidents(prev => prev.filter(resident => resident.id !== id));
      toast({
        title: 'Success',
        description: 'Resident deleted successfully',
      });
      console.log('Deleted resident:', id);
    } catch (error) {
      console.error('Error in deleteResident:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resident',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    residents,
    loading,
    addResident,
    updateResident,
    deleteResident,
    refetch: fetchResidents,
  };
}
