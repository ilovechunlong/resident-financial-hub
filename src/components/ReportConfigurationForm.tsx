
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateReportConfiguration } from '@/hooks/useCreateReportConfiguration';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { ReportFormData } from '@/types/report';

const reportFormSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  report_type: z.enum(['financial_summary', 'transaction_report', 'nursing_home_report', 'resident_report', 'resident_annual_financial_summary', 'nursing_home_annual_financial_summary', 'residents_income_per_nursing_home_monthly', 'resident_income_expense_summary']),
  date_range_start: z.string().optional(),
  date_range_end: z.string().optional(),
  nursing_home_id: z.string().min(1, 'Nursing home is required'),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportConfigurationFormProps {
  onSuccess?: () => void;
}

export function ReportConfigurationForm({ onSuccess }: ReportConfigurationFormProps) {
  const createReportMutation = useCreateReportConfiguration();
  const { nursingHomes, loading: nursingHomesLoading } = useNursingHomes();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      name: '',
      report_type: 'financial_summary',
      date_range_start: '',
      date_range_end: '',
      nursing_home_id: '',
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    try {
      // Transform form values to match ReportFormData type
      const reportData: ReportFormData = {
        name: values.name,
        report_type: values.report_type,
        nursing_home_id: values.nursing_home_id,
        ...(values.date_range_start && { date_range_start: values.date_range_start }),
        ...(values.date_range_end && { date_range_end: values.date_range_end }),
      };
      
      await createReportMutation.mutateAsync(reportData);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating report configuration:', error);
    }
  };

  const reportTypeOptions = [
    { value: 'financial_summary', label: 'Financial Summary' },
    { value: 'transaction_report', label: 'Transaction Report' },
    { value: 'nursing_home_report', label: 'Nursing Home Report' },
    { value: 'resident_report', label: 'Resident Report' },
    { value: 'resident_annual_financial_summary', label: 'Resident Annual Financial Summary' },
    { value: 'nursing_home_annual_financial_summary', label: 'Nursing Home Annual Financial Summary' },
    { value: 'residents_income_per_nursing_home_monthly', label: 'Residents Income per Nursing Home Monthly' },
    { value: 'resident_income_expense_summary', label: 'Resident Income Expense Summary Report' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Report Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter report name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nursing_home_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nursing Home</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nursing home" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nursingHomesLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        nursingHomes?.map((home) => (
                          <SelectItem key={home.id} value={home.id}>
                            {home.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="report_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_range_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_range_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending ? 'Creating...' : 'Create Report Configuration'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
