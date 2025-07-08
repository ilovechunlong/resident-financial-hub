
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DownloadIcon, Trash2Icon } from 'lucide-react';
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

interface ReportCardProps {
  report: any;
  isExpanded: boolean;
  onToggleExpansion: (reportId: string) => void;
  onDownload: (report: any) => void;
  onDelete: (reportId: string) => void;
  children?: React.ReactNode;
}

export function ReportCard({ 
  report, 
  isExpanded, 
  onToggleExpansion, 
  onDownload, 
  onDelete,
  children 
}: ReportCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="border rounded-lg p-4">
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
                onClick={() => onToggleExpansion(report.id)}
              >
                {isExpanded ? 'Hide' : 'Preview'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(report)}
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
                  onClick={() => onDelete(report.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {children}
    </div>
  );
}
