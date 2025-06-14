
import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayIcon, FileTextIcon } from 'lucide-react';
import { useReportConfigurations, useGenerateReport } from '@/hooks/useReports';
import { ReportExportButton } from '@/components/ReportExportButton';

export function ReportsList() {
  const { data: reportConfigurations, isLoading } = useReportConfigurations();
  const generateReportMutation = useGenerateReport();

  const handleGenerateReport = (configurationId: string) => {
    generateReportMutation.mutate(configurationId);
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      'financial_summary': 'Financial Summary',
      'transaction_report': 'Transaction Report',
      'nursing_home_report': 'Nursing Home Report',
      'resident_report': 'Resident Report',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading report configurations...</div>
        </CardContent>
      </Card>
    );
  }

  if (!reportConfigurations || reportConfigurations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No report configurations found.</p>
            <p className="text-sm text-muted-foreground">Create a new report configuration to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Configurations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportConfigurations.map((config) => (
              <TableRow key={config.id}>
                <TableCell className="font-medium">{config.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getReportTypeLabel(config.report_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {config.date_range_start && config.date_range_end ? (
                    <span className="text-sm">
                      {format(new Date(config.date_range_start), 'MMM dd, yyyy')} - {format(new Date(config.date_range_end), 'MMM dd, yyyy')}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No date range</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {format(new Date(config.created_at), 'MMM dd, yyyy')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(config.id)}
                      disabled={generateReportMutation.isPending}
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                    <ReportExportButton configuration={config} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
