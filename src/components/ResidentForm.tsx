
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ResidentFormData } from '@/types/resident';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { BasicInformationFields } from '@/components/forms/BasicInformationFields';
import { EmergencyContactFields } from '@/components/forms/EmergencyContactFields';
import { CareInformationFields } from '@/components/forms/CareInformationFields';
import { AdditionalInformationFields } from '@/components/forms/AdditionalInformationFields';

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
    mobility_level: 'independent',
    care_level: 'independent',
    admission_date: '',
    room_number: '',
    notes: '',
    status: 'active',
    income_types: [],
  });

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
        mobility_level: resident.mobility_level || 'independent',
        care_level: resident.care_level || 'independent',
        admission_date: resident.admission_date || '',
        room_number: resident.room_number || '',
        notes: resident.notes || '',
        status: resident.status || 'active',
        income_types: resident.income_types || [],
      });
    }
  }, [resident]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInformationFields 
        formData={formData} 
        setFormData={setFormData} 
        nursingHomes={nursingHomes} 
      />

      <Separator />

      <EmergencyContactFields 
        formData={formData} 
        setFormData={setFormData} 
      />

      <Separator />

      <CareInformationFields 
        formData={formData} 
        setFormData={setFormData} 
      />

      <Separator />

      <AdditionalInformationFields 
        formData={formData} 
        setFormData={setFormData} 
      />

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
