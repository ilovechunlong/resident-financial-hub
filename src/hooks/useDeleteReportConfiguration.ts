
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteReportConfiguration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (configurationId: string) => {
      console.log('Deleting report configuration:', configurationId);
      
      // First, delete associated generated reports
      const { error: reportsError } = await supabase
        .from('generated_reports')
        .delete()
        .eq('configuration_id', configurationId);

      if (reportsError) {
        console.error('Error deleting associated generated reports:', reportsError);
        throw reportsError;
      }

      // Then delete the configuration
      const { error } = await supabase
        .from('report_configurations')
        .delete()
        .eq('id', configurationId);

      if (error) {
        console.error('Error deleting report configuration:', error);
        throw error;
      }

      return configurationId;
    },
    onSuccess: () => {
      console.log('Report configuration deleted successfully');
      toast({
        title: 'Success',
        description: 'Report configuration and associated reports deleted successfully.',
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['report-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
    },
    onError: (error: any) => {
      console.error('Error deleting report configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete report configuration. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
