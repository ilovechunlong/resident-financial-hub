
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { ResidentFormData } from '@/types/resident';
import { useNursingHomes } from '@/hooks/useNursingHomes';

interface ResidentFormProps {
  resident?: any;
  onSubmit: (data: ResidentFormData) => void;
  onCancel: () => void;
}

export function ResidentForm({ resident, onSubmit, onCancel }: ResidentFormProps) {
  const { nursingHomes } = useNursingHomes();
  const [formData, setFormData] = useState<ResidentFormData>({
    nursing_home_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    phone_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    medical_conditions: [],
    medications: [],
    dietary_restrictions: [],
    mobility_level: 'independent',
    care_level: 'independent',
    admission_date: '',
    room_number: '',
    insurance_provider: '',
    insurance_policy_number: '',
    notes: '',
    status: 'active',
  });

  const [newMedicalCondition, setNewMedicalCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');

  useEffect(() => {
    if (resident) {
      setFormData({
        nursing_home_id: resident.nursing_home_id || '',
        first_name: resident.first_name || '',
        last_name: resident.last_name || '',
        date_of_birth: resident.date_of_birth || '',
        gender: resident.gender || 'male',
        phone_number: resident.phone_number || '',
        emergency_contact_name: resident.emergency_contact_name || '',
        emergency_contact_phone: resident.emergency_contact_phone || '',
        emergency_contact_relationship: resident.emergency_contact_relationship || '',
        medical_conditions: resident.medical_conditions || [],
        medications: resident.medications || [],
        dietary_restrictions: resident.dietary_restrictions || [],
        mobility_level: resident.mobility_level || 'independent',
        care_level: resident.care_level || 'independent',
        admission_date: resident.admission_date || '',
        room_number: resident.room_number || '',
        insurance_provider: resident.insurance_provider || '',
        insurance_policy_number: resident.insurance_policy_number || '',
        notes: resident.notes || '',
        status: resident.status || 'active',
      });
    }
  }, [resident]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addArrayItem = (field: 'medical_conditions' | 'medications' | 'dietary_restrictions', value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
      setter('');
    }
  };

  const removeArrayItem = (field: 'medical_conditions' | 'medications' | 'dietary_restrictions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
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

      <Separator />

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="emergency_contact_name">Contact Name *</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="emergency_contact_phone">Contact Phone *</Label>
            <Input
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="emergency_contact_relationship">Relationship *</Label>
            <Input
              id="emergency_contact_relationship"
              value={formData.emergency_contact_relationship}
              onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_relationship: e.target.value }))}
              required
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Care Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Care Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mobility_level">Mobility Level *</Label>
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
            <Label htmlFor="care_level">Care Level *</Label>
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
            <Label htmlFor="admission_date">Admission Date *</Label>
            <Input
              id="admission_date"
              type="date"
              value={formData.admission_date}
              onChange={(e) => setFormData(prev => ({ ...prev, admission_date: e.target.value }))}
              required
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

      <Separator />

      {/* Medical Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
        
        {/* Medical Conditions */}
        <div className="mb-4">
          <Label>Medical Conditions</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add medical condition"
              value={newMedicalCondition}
              onChange={(e) => setNewMedicalCondition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('medical_conditions', newMedicalCondition, setNewMedicalCondition))}
            />
            <Button type="button" onClick={() => addArrayItem('medical_conditions', newMedicalCondition, setNewMedicalCondition)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.medical_conditions?.map((condition, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {condition}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeArrayItem('medical_conditions', index)} />
              </Badge>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="mb-4">
          <Label>Medications</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add medication"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('medications', newMedication, setNewMedication))}
            />
            <Button type="button" onClick={() => addArrayItem('medications', newMedication, setNewMedication)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.medications?.map((medication, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {medication}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeArrayItem('medications', index)} />
              </Badge>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="mb-4">
          <Label>Dietary Restrictions</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add dietary restriction"
              value={newDietaryRestriction}
              onChange={(e) => setNewDietaryRestriction(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('dietary_restrictions', newDietaryRestriction, setNewDietaryRestriction))}
            />
            <Button type="button" onClick={() => addArrayItem('dietary_restrictions', newDietaryRestriction, setNewDietaryRestriction)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.dietary_restrictions?.map((restriction, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {restriction}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeArrayItem('dietary_restrictions', index)} />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Insurance Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="insurance_provider">Insurance Provider</Label>
            <Input
              id="insurance_provider"
              value={formData.insurance_provider}
              onChange={(e) => setFormData(prev => ({ ...prev, insurance_provider: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="insurance_policy_number">Policy Number</Label>
            <Input
              id="insurance_policy_number"
              value={formData.insurance_policy_number}
              onChange={(e) => setFormData(prev => ({ ...prev, insurance_policy_number: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Additional Information */}
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

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          {resident ? 'Update Resident' : 'Add Resident'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
