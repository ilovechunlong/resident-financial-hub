import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ResidentsHeaderProps {
  onOpenOnboarding: () => void;
}

export function ResidentsHeader({ onOpenOnboarding }: ResidentsHeaderProps) {
  return (
    <div className="flex justify-end items-center">
      <Button onClick={onOpenOnboarding} className="bg-healthcare-primary hover:bg-healthcare-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Onboard New Resident
      </Button>
    </div>
  );
}
