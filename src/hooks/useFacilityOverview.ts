
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FacilityOverview {
  id: string;
  name: string;
  currentResidents: number;
  capacity: number;
  occupancyRate: number;
}

export const useFacilityOverview = () => {
  return useQuery({
    queryKey: ['facility-overview'],
    queryFn: async (): Promise<FacilityOverview[]> => {
      console.log('Fetching facility overview...');
      
      const { data: nursingHomes, error } = await supabase
        .from('nursing_homes')
        .select('id, name, capacity, current_residents')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching nursing homes:', error);
        throw error;
      }

      const facilities = nursingHomes?.map(home => ({
        id: home.id,
        name: home.name,
        currentResidents: home.current_residents || 0,
        capacity: home.capacity,
        occupancyRate: home.capacity > 0 ? Math.round((home.current_residents || 0) / home.capacity * 100) : 0,
      })) || [];

      console.log('Facility overview fetched:', facilities);
      return facilities;
    },
  });
};
