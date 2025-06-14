
export interface Resident {
  id: string;
  nursing_home_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone_number?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  mobility_level: 'independent' | 'assisted' | 'wheelchair' | 'bedridden';
  care_level: 'independent' | 'assisted_living' | 'memory_care' | 'skilled_nursing';
  admission_date: string;
  room_number?: string;
  notes?: string;
  status: 'active' | 'discharged' | 'deceased' | 'temporary_leave';
  income_types?: string[];
  created_at: string;
  updated_at: string;
}

export interface ResidentFormData {
  nursing_home_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone_number?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  mobility_level: 'independent' | 'assisted' | 'wheelchair' | 'bedridden';
  care_level: 'independent' | 'assisted_living' | 'memory_care' | 'skilled_nursing';
  admission_date: string;
  room_number?: string;
  notes?: string;
  status: 'active' | 'discharged' | 'deceased' | 'temporary_leave';
  income_types?: string[];
}
