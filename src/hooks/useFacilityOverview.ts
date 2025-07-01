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

      // Fetch all active nursing homes
      const { data: nursingHomes, error: nhError } = await supabase
        .from('nursing_homes')
        .select('id, name, capacity')
        .eq('status', 'active')
        .order('name');

      if (nhError) {
        console.error('Error fetching nursing homes:', nhError);
        throw nhError;
      }

      // Fetch all active residents
      const { data: residents, error: resError } = await supabase
        .from('residents')
        .select('id, nursing_home_id, status')
        .eq('status', 'active');

      if (resError) {
        console.error('Error fetching residents:', resError);
        throw resError;
      }

      // Count residents per facility
      const residentCountMap: Record<string, number> = {};
      residents?.forEach(resident => {
        if (resident.nursing_home_id) {
          residentCountMap[resident.nursing_home_id] = (residentCountMap[resident.nursing_home_id] || 0) + 1;
        }
      });

      const facilities = nursingHomes?.map(home => {
        const currentResidents = residentCountMap[home.id] || 0;
        return {
          id: home.id,
          name: home.name,
          currentResidents,
          capacity: home.capacity,
          occupancyRate: home.capacity > 0 ? Math.round((currentResidents / home.capacity) * 100) : 0,
        };
      }) || [];

      console.log('Facility overview fetched:', facilities);
      return facilities;
    },
  });
};
