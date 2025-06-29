
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportConfiguration, ReportFormData } from '@/types/report';
import { useToast } from '@/hooks/use-toast';

export const useCreateReportConfiguration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reportData: ReportFormData): Promise<ReportConfiguration> => {
      console.log('Creating report configuration:', reportData);
      
      const { data, error } = await supabase
        .from('report_configurations')
        .insert([reportData])
        .select()
        .single();

      if (error) {
        console.error('Error creating report configuration:', error);
        throw error;
      }

      console.log('Report configuration created:', data);
      return data as ReportConfiguration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-configurations'] });
      toast({
        title: "Success",
        description: "Report configuration created successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('Failed to create report configuration:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report configuration. Please try again.",
      });
    },
  });
};
