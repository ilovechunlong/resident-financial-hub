
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ResidentsHeaderProps {
  onOpenOnboarding: () => void;
}

export function ResidentsHeader({ onOpenOnboarding }: ResidentsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Resident Management</h1>
        <p className="text-muted-foreground">Manage residents across all facilities</p>
      </div>
      <Button onClick={onOpenOnboarding} className="bg-healthcare-primary hover:bg-healthcare-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Onboard New Resident
      </Button>
    </div>
  );
}
