
import { useState, useCallback } from 'react';
import { NursingHome, NursingHomeFormData } from '@/types/nursingHome';

// Mock data for demonstration
const mockNursingHomes: NursingHome[] = [
  {
    id: '1',
    name: 'Sunset Manor Care Center',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    phoneNumber: '(555) 123-4567',
    email: 'admin@sunsetmanor.com',
    capacity: 150,
    currentResidents: 142,
    status: 'active',
    administrator: 'Sarah Johnson',
    licenseNumber: 'NH-IL-001234',
    accreditation: 'Joint Commission',
    specialties: ['Memory Care', 'Rehabilitation', 'Hospice Care'],
    amenities: ['Garden', 'Library', 'Physical Therapy', 'Beauty Salon'],
    description: 'A leading care facility providing comprehensive services for seniors.',
    monthlyRate: 4500,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    name: 'Golden Years Residence',
    address: '456 Maple Avenue',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    phoneNumber: '(555) 234-5678',
    email: 'info@goldenyears.com',
    capacity: 100,
    currentResidents: 85,
    status: 'active',
    administrator: 'Michael Chen',
    licenseNumber: 'NH-IL-001235',
    accreditation: 'CARF',
    specialties: ['Assisted Living', 'Independent Living'],
    amenities: ['Pool', 'Fitness Center', 'Restaurant', 'Chapel'],
    description: 'Modern facility focusing on active senior living.',
    monthlyRate: 3800,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-01-08'),
  },
];

export function useNursingHomes() {
  const [nursingHomes, setNursingHomes] = useState<NursingHome[]>(mockNursingHomes);

  const addNursingHome = useCallback((data: NursingHomeFormData) => {
    const newHome: NursingHome = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNursingHomes(prev => [...prev, newHome]);
    console.log('Added nursing home:', newHome);
  }, []);

  const updateNursingHome = useCallback((id: string, data: NursingHomeFormData) => {
    setNursingHomes(prev => prev.map(home => 
      home.id === id 
        ? { ...home, ...data, updatedAt: new Date() }
        : home
    ));
    console.log('Updated nursing home:', id, data);
  }, []);

  const deleteNursingHome = useCallback((id: string) => {
    setNursingHomes(prev => prev.filter(home => home.id !== id));
    console.log('Deleted nursing home:', id);
  }, []);

  return {
    nursingHomes,
    addNursingHome,
    updateNursingHome,
    deleteNursingHome,
  };
}
