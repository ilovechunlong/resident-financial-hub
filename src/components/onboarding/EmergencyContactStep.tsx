
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmergencyContactStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function EmergencyContactStep({ formData, updateFormData }: EmergencyContactStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please provide details for the primary emergency contact person (optional).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="emergency_contact_name">Contact Name</Label>
          <Input
            id="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={(e) => updateFormData({ emergency_contact_name: e.target.value })}
            placeholder="Enter full name of emergency contact"
          />
        </div>

        <div>
          <Label htmlFor="emergency_contact_relationship">Relationship</Label>
          <Input
            id="emergency_contact_relationship"
            value={formData.emergency_contact_relationship}
            onChange={(e) => updateFormData({ emergency_contact_relationship: e.target.value })}
            placeholder="e.g., Son, Daughter, Spouse, Friend"
          />
        </div>

        <div>
          <Label htmlFor="emergency_contact_phone">Phone Number</Label>
          <Input
            id="emergency_contact_phone"
            type="tel"
            value={formData.emergency_contact_phone}
            onChange={(e) => updateFormData({ emergency_contact_phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Note</h4>
        <p className="text-sm text-blue-800">
          If provided, this person will be contacted in case of emergencies or if we need to discuss the resident's care. 
          You can add this information later if it's not available right now.
        </p>
      </div>
    </div>
  );
}
