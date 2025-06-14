
export interface NursingHome {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  capacity: number;
  currentResidents: number;
  status: 'active' | 'inactive' | 'maintenance';
  administrator: string;
  licenseNumber: string;
  accreditation?: string;
  specialties: string[];
  amenities: string[];
  description?: string;
  monthlyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NursingHomeFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  capacity: number;
  currentResidents: number;
  status: 'active' | 'inactive' | 'maintenance';
  administrator: string;
  licenseNumber: string;
  accreditation?: string;
  specialties: string[];
  amenities: string[];
  description?: string;
  monthlyRate: number;
}
