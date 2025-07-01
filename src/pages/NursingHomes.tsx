import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NursingHomeForm } from '@/components/NursingHomeForm';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { useResidents } from '@/hooks/useResidents';
import { NursingHome } from '@/types/nursingHome';

export default function NursingHomes() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHome, setEditingHome] = useState<NursingHome | undefined>();
  const { nursingHomes, loading, addNursingHome, updateNursingHome, deleteNursingHome } = useNursingHomes();
  const { residents, loading: residentsLoading } = useResidents();

  // Map of nursing_home_id to active resident count
  const residentCountMap: Record<string, number> = {};
  residents?.forEach(resident => {
    if (resident.status === 'active' && resident.nursing_home_id) {
      residentCountMap[resident.nursing_home_id] = (residentCountMap[resident.nursing_home_id] || 0) + 1;
    }
  });

  const handleEdit = (home: NursingHome) => {
    setEditingHome(home);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this nursing home?')) {
      deleteNursingHome(id);
    }
  };

  const handleFormSubmit = (data: Omit<NursingHome, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingHome) {
      updateNursingHome(editingHome.id, data);
    } else {
      addNursingHome(data);
    }
    setIsFormOpen(false);
    setEditingHome(undefined);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingHome(undefined);
  };

  if (loading || residentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading nursing homes...</span>
        </div>
      </div>
    );
  }

  // Calculate total occupied beds and occupancy rate
  const totalCapacity = nursingHomes.reduce((sum, home) => sum + home.capacity, 0);
  const totalOccupiedBeds = nursingHomes.reduce((sum, home) => sum + (residentCountMap[home.id] || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupiedBeds / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Nursing Home
        </Button>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nursingHomes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOccupiedBeds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Nursing Homes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
          <CardDescription>
            Manage all your nursing home facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nursingHomes.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No nursing homes yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first nursing home facility.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Nursing Home
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nursingHomes.map((home) => (
                  <TableRow key={home.id}>
                    <TableCell className="font-medium">{home.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{home.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{home.phone_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{home.capacity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{residentCountMap[home.id] || 0}/{home.capacity}</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-healthcare-primary rounded-full"
                            style={{ width: `${home.capacity > 0 ? ((residentCountMap[home.id] || 0) / home.capacity) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        home.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : home.status === 'inactive'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {home.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(home)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(home.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Nursing Home Form Modal */}
      {isFormOpen && (
        <NursingHomeForm
          initialData={editingHome}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
