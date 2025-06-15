
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export function SecuritySettings() {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);

  const handleSessionTimeoutChange = (value: number) => {
    setSessionTimeout(value);
    toast({
      title: "Session timeout updated",
      description: `Session timeout set to ${value} minutes.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Two-Factor Authentication</label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account.
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Session Timeout (minutes)</label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={sessionTimeout}
              onChange={(e) => handleSessionTimeoutChange(Number(e.target.value))}
              min="5"
              max="480"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Automatically log out after this period of inactivity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
