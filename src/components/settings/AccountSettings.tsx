
import React from 'react';
import { ChangePasswordForm } from './ChangePasswordForm';
import { SecuritySettings } from './SecuritySettings';
import { AccountActions } from './AccountActions';

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <ChangePasswordForm />
      <SecuritySettings />
      <AccountActions />
    </div>
  );
}
