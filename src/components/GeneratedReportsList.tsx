
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
import { DownloadIcon, FileTextIcon, Trash2Icon } from 'lucide-react';
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
import { useGeneratedReports } from '@/hooks/useGeneratedReports';
import { useDeleteGeneratedReport } from '@/hooks/useDeleteGeneratedReport';

export function GeneratedReportsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const limit = 10;
  
  const { data: generatedReportsData, isLoading } = useGeneratedReports(undefined, { page: currentPage, limit });
  const deleteReportMutation = useDeleteGeneratedReport();

  const handleDownloadReport = (report: any) => {
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(report.report_data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `report_${report.id}_${format(new Date(report.generated_at), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleDeleteReport = (reportId: string) => {
    deleteReportMutation.mutate(reportId);
  };

  const toggleReportExpansion = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderReportPreview = (report: any) => {
    const isExpanded = expandedReports.has(report.id);
    
    if (!isExpanded || report.status !== 'completed') return null;

    const reportData = report.report_data;
    const reportType = reportData.report_type;

    if (reportType === 'residents_income_per_nursing_home_monthly') {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Report Preview</h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reportData.data?.map((item: any, index: number) => (
              <div key={`${item.nursingHomeId}-${item.monthSort}`} className="border rounded-lg p-3 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-semibold text-lg">{item.nursingHomeName}</h5>
                  <Badge variant="outline">{item.month}</Badge>
                </div>
                
                <div className="mb-3 p-2 bg-blue-50 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Monthly Total:</span>
                    <span className="font-semibold">${item.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Transactions:</span>
                    <span>{item.totalTransactions}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h6 className="font-medium text-sm text-gray-700 mb-2">Resident Breakdown:</h6>
                  {item.residentBreakdown?.map((resident: any) => (
                    <div key={resident.residentId} className="flex justify-between text-sm py-1 px-2 bg-gray-50 rounded">
                      <span>{resident.residentName}</span>
                      <div className="flex gap-4">
                        <span>${resident.totalIncome.toLocaleString()}</span>
                        <span className="text-gray-500">({resident.transactionCount} transactions)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default preview for other report types
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Report Preview</h4>
        <div className="text-sm text-gray-600">
          <p>Total Records: {reportData.total_records || 'N/A'}</p>
          <p>Generated: {format(new Date(reportData.generated_at), 'MMM dd, yyyy HH:mm')}</p>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (!generatedReportsData || generatedReportsData.totalPages <= 1) return null;

    const { totalPages } = generatedReportsData;
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
          <div className="text-center">Loading generated reports...</div>
        </CardContent>
      </Card>
    );
  }

  if (!generatedReportsData || generatedReportsData.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reports have been generated yet.</p>
            <p className="text-sm text-muted-foreground">Generate a report from a configuration to see it here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data: generatedReports } = generatedReportsData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Configurations ({generatedReportsData.total} total)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {generatedReports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm">{report.id.slice(0, 8)}...</span>
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {format(new Date(report.generated_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {report.status === 'completed' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleReportExpansion(report.id)}
                      >
                        {expandedReports.has(report.id) ? 'Hide' : 'Preview'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
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
                        <AlertDialogTitle>Delete Generated Report</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this generated report? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteReport(report.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {renderReportPreview(report)}
            </div>
          ))}
        </div>

        {renderPagination()}
      </CardContent>
    </Card>
  );
}
