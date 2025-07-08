
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileTextIcon } from 'lucide-react';
import { useGeneratedReports } from '@/hooks/useGeneratedReports';
import { useDeleteGeneratedReport } from '@/hooks/useDeleteGeneratedReport';
import { ReportCard } from './reports/ReportCard';
import { ReportPreview } from './reports/ReportPreview';
import { ReportsPagination } from './reports/ReportsPagination';

export function GeneratedReportsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const [expandedResidents, setExpandedResidents] = useState<Set<string>>(new Set());
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

  const toggleResidentExpansion = (residentKey: string) => {
    const newExpanded = new Set(expandedResidents);
    if (newExpanded.has(residentKey)) {
      newExpanded.delete(residentKey);
    } else {
      newExpanded.add(residentKey);
    }
    setExpandedResidents(newExpanded);
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
          <CardTitle>Generated Reports</CardTitle>
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
        <CardTitle>Generated Reports ({generatedReportsData.total} total)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {generatedReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isExpanded={expandedReports.has(report.id)}
              onToggleExpansion={toggleReportExpansion}
              onDownload={handleDownloadReport}
              onDelete={handleDeleteReport}
            >
              <ReportPreview
                report={report}
                isExpanded={expandedReports.has(report.id)}
                expandedResidents={expandedResidents}
                onToggleResidentExpansion={toggleResidentExpansion}
              />
            </ReportCard>
          ))}
        </div>

        <ReportsPagination
          currentPage={currentPage}
          totalPages={generatedReportsData.totalPages}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  );
}
