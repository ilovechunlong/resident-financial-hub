
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteGeneratedReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reportId: string) => {
      console.log('Deleting generated report:', reportId);
      
      const { error } = await supabase
        .from('generated_reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('Error deleting generated report:', error);
        throw error;
      }

      return reportId;
    },
    onSuccess: () => {
      console.log('Generated report deleted successfully');
      toast({
        title: 'Success',
        description: 'Generated report deleted successfully.',
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
    },
    onError: (error: any) => {
      console.error('Error deleting generated report:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete generated report. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
