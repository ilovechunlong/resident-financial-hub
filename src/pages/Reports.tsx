
import React from 'react';
import { ReportConfigurationForm } from '@/components/ReportConfigurationForm';
import { ReportsList } from '@/components/ReportsList';
import { GeneratedReportsList } from '@/components/GeneratedReportsList';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">
          Generate comprehensive financial and operational reports for your nursing home management system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ReportConfigurationForm />
        </div>
        <div className="space-y-6">
          <ReportsList />
        </div>
      </div>

      <GeneratedReportsList />
    </div>
  );
}
