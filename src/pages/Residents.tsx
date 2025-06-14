
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useResidents } from '@/hooks/useResidents';
import { Resident } from '@/types/resident';
import { ResidentsHeader } from '@/components/residents/ResidentsHeader';
import { ResidentStatistics } from '@/components/residents/ResidentStatistics';
import { ResidentFilters } from '@/components/residents/ResidentFilters';
import { ResidentsTable } from '@/components/residents/ResidentsTable';
import { ResidentDialogs } from '@/components/residents/ResidentDialogs';

export default function Residents() {
  const { residents, loading, addResident, updateResident, deleteResident } = useResidents();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleAddResident = async (data: any) => {
    await addResident(data);
    setIsOnboardingOpen(false);
  };

  const handleEditResident = async (data: any) => {
    if (editingResident) {
      await updateResident(editingResident.id, data);
      setEditingResident(null);
    }
  };

  const handleDeleteResident = async (id: string) => {
    if (confirm('Are you sure you want to delete this resident? This action cannot be undone.')) {
      await deleteResident(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading residents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResidentsHeader onOpenOnboarding={() => setIsOnboardingOpen(true)} />

      <ResidentStatistics residents={residents} />

      <Card>
        <CardHeader>
          <CardTitle>Residents</CardTitle>
          <CardDescription>
            Comprehensive list of all residents across facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResidentFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <ResidentsTable
            residents={residents}
            onEditResident={setEditingResident}
            onDeleteResident={handleDeleteResident}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        </CardContent>
      </Card>

      <ResidentDialogs
        isOnboardingOpen={isOnboardingOpen}
        setIsOnboardingOpen={setIsOnboardingOpen}
        editingResident={editingResident}
        setEditingResident={setEditingResident}
        onAddResident={handleAddResident}
        onEditResident={handleEditResident}
      />
    </div>
  );
}
