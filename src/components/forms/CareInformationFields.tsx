
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ResidentFormData } from '@/types/resident';

interface CareInformationFieldsProps {
  formData: ResidentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResidentFormData>>;
}

export function CareInformationFields({ formData, setFormData }: CareInformationFieldsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Care Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mobility_level">Mobility Level</Label>
          <Select value={formData.mobility_level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, mobility_level: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="independent">Independent</SelectItem>
              <SelectItem value="assisted">Assisted</SelectItem>
              <SelectItem value="wheelchair">Wheelchair</SelectItem>
              <SelectItem value="bedridden">Bedridden</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="care_level">Care Level</Label>
          <Select value={formData.care_level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, care_level: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="independent">Independent</SelectItem>
              <SelectItem value="assisted_living">Assisted Living</SelectItem>
              <SelectItem value="memory_care">Memory Care</SelectItem>
              <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="admission_date">Admission Date</Label>
          <Input
            id="admission_date"
            type="date"
            value={formData.admission_date}
            onChange={(e) => setFormData(prev => ({ ...prev, admission_date: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="room_number">Room Number</Label>
          <Input
            id="room_number"
            value={formData.room_number}
            onChange={(e) => setFormData(prev => ({ ...prev, room_number: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
