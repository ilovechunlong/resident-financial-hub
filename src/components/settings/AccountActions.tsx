
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AccountActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button variant="outline">
            Download Account Data
          </Button>
          <p className="text-sm text-muted-foreground mt-1">
            Download a copy of your account data and activity.
          </p>
        </div>

        <div>
          <Button variant="destructive">
            Delete Account
          </Button>
          <p className="text-sm text-muted-foreground mt-1">
            Permanently delete your account and all associated data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
