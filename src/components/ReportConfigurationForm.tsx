
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
import { useCreateReportConfiguration } from '@/hooks/useReports';

const reportFormSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  report_type: z.enum(['financial_summary', 'transaction_report', 'nursing_home_report', 'resident_report']),
  date_range_start: z.string().optional(),
  date_range_end: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportConfigurationFormProps {
  onSuccess?: () => void;
}

export function ReportConfigurationForm({ onSuccess }: ReportConfigurationFormProps) {
  const createReportMutation = useCreateReportConfiguration();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      name: '',
      report_type: 'financial_summary',
      date_range_start: '',
      date_range_end: '',
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    try {
      await createReportMutation.mutateAsync(values);
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
