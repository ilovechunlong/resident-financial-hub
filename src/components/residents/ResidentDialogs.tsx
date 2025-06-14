
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResidentOnboardingForm } from '@/components/ResidentOnboardingForm';
import { ResidentForm } from '@/components/ResidentForm';
import { Resident } from '@/types/resident';

interface ResidentDialogsProps {
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  editingResident: Resident | null;
  setEditingResident: (resident: Resident | null) => void;
  onAddResident: (data: any) => void;
  onEditResident: (data: any) => void;
}

export function ResidentDialogs({
  isOnboardingOpen,
  setIsOnboardingOpen,
  editingResident,
  setEditingResident,
  onAddResident,
  onEditResident
}: ResidentDialogsProps) {
  return (
    <>
      {/* Onboard New Resident Dialog */}
      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Onboard New Resident</DialogTitle>
          </DialogHeader>
          <ResidentOnboardingForm
            onSubmit={onAddResident}
            onCancel={() => setIsOnboardingOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Resident Dialog */}
      <Dialog open={!!editingResident} onOpenChange={() => setEditingResident(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
          </DialogHeader>
          {editingResident && (
            <ResidentForm
              resident={editingResident}
              onSubmit={onEditResident}
              onCancel={() => setEditingResident(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
