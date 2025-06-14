
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ResidentFormData } from '@/types/resident';

interface AdditionalInformationFieldsProps {
  formData: ResidentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResidentFormData>>;
}

export function AdditionalInformationFields({ formData, setFormData }: AdditionalInformationFieldsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
              <SelectItem value="deceased">Deceased</SelectItem>
              <SelectItem value="temporary_leave">Temporary Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
