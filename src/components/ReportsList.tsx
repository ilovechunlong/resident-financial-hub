import React, { useState } from 'react';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useReportConfigurations } from '@/hooks/useReportConfigurations';
import { useGenerateReport } from '@/hooks/useGenerateReport';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { ReportExportButton } from '@/components/ReportExportButton';

export function ReportsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  const { data: reportConfigurationsData, isLoading } = useReportConfigurations({ page: currentPage, limit });
  const { nursingHomes } = useNursingHomes();
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
      'resident_annual_financial_summary': 'Resident Annual Financial Summary',
      'nursing_home_annual_financial_summary': 'Nursing Home Annual Financial Summary',
      'residents_income_per_nursing_home_monthly': 'Residents Income per Nursing Home Monthly',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getNursingHomeName = (nursingHomeId: string | null) => {
    if (!nursingHomeId || !nursingHomes) return 'All Nursing Homes';
    const home = nursingHomes.find(h => h.id === nursingHomeId);
    return home?.name || 'Unknown';
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

  if (!reportConfigurationsData || reportConfigurationsData.data.length === 0) {
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

  const { data: reportConfigurations, totalPages } = reportConfigurationsData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Configurations ({reportConfigurationsData.total} total)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Nursing Home</TableHead>
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
                  <span className="text-sm">{getNursingHomeName(config.nursing_home_id)}</span>
                </TableCell>
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

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && <PaginationEllipsis />}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
