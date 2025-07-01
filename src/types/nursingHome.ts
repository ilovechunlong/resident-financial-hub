export interface NursingHome {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number: string;
  email: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  administrator: string;
  license_number: string;
  accreditation?: string;
  specialties: string[];
  amenities: string[];
  description?: string;
  monthly_rate: number;
  created_at: string;
  updated_at: string;
}

export interface NursingHomeFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number: string;
  email: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  administrator: string;
  license_number: string;
  accreditation?: string;
  specialties: string[];
  amenities: string[];
  description?: string;
  monthly_rate: number;
}
