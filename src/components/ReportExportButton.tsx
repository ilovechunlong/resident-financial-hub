
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DownloadIcon, FileTextIcon, TableIcon, LoaderIcon } from 'lucide-react';
import { ReportGenerator } from '@/utils/reportGenerator';
import { useToast } from '@/hooks/use-toast';
import { ReportConfiguration } from '@/types/report';

interface ReportExportButtonProps {
  configuration: ReportConfiguration;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ReportExportButton({ configuration, variant = 'outline', size = 'sm' }: ReportExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsGenerating(true);
    
    try {
      console.log('Starting report export:', { format, configuration });
      
      const reportData = await ReportGenerator.generateReportData(
        configuration.id,
        configuration.report_type,
        {
          start: configuration.date_range_start || undefined,
          end: configuration.date_range_end || undefined,
        }
      );

      if (format === 'pdf') {
        ReportGenerator.generatePDF(reportData);
      } else {
        ReportGenerator.generateExcel(reportData);
      }

      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()} successfully.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Button variant={variant} size={size} disabled>
        <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
        Generating...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileTextIcon className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <TableIcon className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
