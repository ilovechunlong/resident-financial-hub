
import React from 'react';
import { ReportConfigurationForm } from '@/components/ReportConfigurationForm';
import { ReportsList } from '@/components/ReportsList';

export default function Reports() {
  return (
    <div className="space-y-6">
      <ReportConfigurationForm />
      <ReportsList />
    </div>
  );
}
