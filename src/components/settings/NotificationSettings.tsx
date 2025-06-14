
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export function NotificationSettings() {
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'financial-alerts',
      title: 'Financial Alerts',
      description: 'Get notified about important financial transactions and budget updates.',
      email: true,
      push: true,
      sms: false,
    },
    {
      id: 'resident-updates',
      title: 'Resident Updates',
      description: 'Notifications about resident admissions, discharges, and status changes.',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'system-maintenance',
      title: 'System Maintenance',
      description: 'Updates about scheduled maintenance and system downtime.',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'report-generation',
      title: 'Report Generation',
      description: 'Notifications when reports are completed and ready for review.',
      email: false,
      push: true,
      sms: false,
    },
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      description: 'Important security notifications and login alerts.',
      email: true,
      push: true,
      sms: true,
    },
  ]);

  const updatePreference = (id: string, channel: 'email' | 'push' | 'sms', value: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, [channel]: value } : pref
      )
    );
  };

  const savePreferences = () => {
    // TODO: Implement actual save logic
    console.log('Saving notification preferences:', preferences);
    
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 items-center pb-2 border-b">
              <div className="col-span-6">
                <span className="text-sm font-medium">Notification Type</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-medium">Email</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-medium">Push</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-medium">SMS</span>
              </div>
            </div>

            {/* Notification preferences */}
            {preferences.map((pref) => (
              <div key={pref.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6">
                  <div>
                    <h4 className="text-sm font-medium">{pref.title}</h4>
                    <p className="text-sm text-muted-foreground">{pref.description}</p>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={pref.email}
                    onCheckedChange={(value) => updatePreference(pref.id, 'email', value)}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={pref.push}
                    onCheckedChange={(value) => updatePreference(pref.id, 'push', value)}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={pref.sms}
                    onCheckedChange={(value) => updatePreference(pref.id, 'sms', value)}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Button onClick={savePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Daily Summary</label>
              <p className="text-sm text-muted-foreground">
                Receive a daily summary of system activity.
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Weekly Reports</label>
              <p className="text-sm text-muted-foreground">
                Get weekly performance and financial reports.
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Marketing Communications</label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and product announcements.
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
