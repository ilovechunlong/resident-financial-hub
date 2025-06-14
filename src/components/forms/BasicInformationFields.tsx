
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ResidentFormData } from '@/types/resident';
import { NursingHome } from '@/types/nursingHome';

interface BasicInformationFieldsProps {
  formData: ResidentFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResidentFormData>>;
  nursingHomes: NursingHome[];
}

export function BasicInformationFields({ formData, setFormData, nursingHomes }: BasicInformationFieldsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nursing_home_id">Nursing Home *</Label>
          <Select value={formData.nursing_home_id} onValueChange={(value) => setFormData(prev => ({ ...prev, nursing_home_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select nursing home" />
            </SelectTrigger>
            <SelectContent>
              {nursingHomes.map((home) => (
                <SelectItem key={home.id} value={home.id}>
                  {home.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value: any) => setFormData(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
