
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
import { PlayIcon, FileTextIcon, Trash2Icon } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useReportConfigurations } from '@/hooks/useReportConfigurations';
import { useGenerateReport } from '@/hooks/useGenerateReport';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { useDeleteReportConfiguration } from '@/hooks/useDeleteReportConfiguration';
import { ReportExportButton } from '@/components/ReportExportButton';

export function ReportsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  const { data: reportConfigurationsData, isLoading } = useReportConfigurations({ page: currentPage, limit });
  const { nursingHomes } = useNursingHomes();
  const generateReportMutation = useGenerateReport();
  const deleteConfigurationMutation = useDeleteReportConfiguration();

  const handleGenerateReport = (configurationId: string) => {
    generateReportMutation.mutate(configurationId);
  };

  const handleDeleteConfiguration = (configurationId: string) => {
    deleteConfigurationMutation.mutate(configurationId);
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      'transaction_report': 'Transaction Report',
      'resident_report': 'Resident Report',
      'resident_annual_financial_summary': 'Resident Annual Financial Summary',
      'nursing_home_annual_financial_summary': 'Nursing Home Annual Financial Summary',
      'residents_income_per_nursing_home_monthly': 'Residents Income per Nursing Home Monthly',
      'resident_income_expense_summary': 'Resident Income Expense Summary Report',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getNursingHomeName = (nursingHomeId: string | null) => {
    if (!nursingHomeId || !nursingHomes) return 'All Nursing Homes';
    const home = nursingHomes.find(h => h.id === nursingHomeId);
    return home?.name || 'Unknown';
  };

  const renderPagination = () => {
    if (!reportConfigurationsData || reportConfigurationsData.totalPages <= 1) return null;

    const { totalPages } = reportConfigurationsData;
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {startPage > 2 && <PaginationEllipsis />}
              </>
            )}

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
              const pageNum = startPage + i;
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

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <PaginationEllipsis />}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
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

  const { data: reportConfigurations } = reportConfigurationsData;

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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Report Configuration</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this report configuration? This action cannot be undone and will also delete any generated reports associated with this configuration.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteConfiguration(config.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {renderPagination()}
      </CardContent>
    </Card>
  );
}
