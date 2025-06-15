
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResidentFormData } from '@/types/resident';

interface EmergencyContactFieldsProps {
  formData: ResidentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResidentFormData>>;
}

export function EmergencyContactFields({ formData, setFormData }: EmergencyContactFieldsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="emergency_contact_name">Contact Name</Label>
          <Input
            id="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
          <Input
            id="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="emergency_contact_relationship">Relationship</Label>
          <Input
            id="emergency_contact_relationship"
            value={formData.emergency_contact_relationship}
            onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_relationship: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
