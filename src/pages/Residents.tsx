
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResidentForm } from '@/components/ResidentForm';
import { useResidents } from '@/hooks/useResidents';
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { Resident } from '@/types/resident';

export default function Residents() {
  const { residents, loading, addResident, updateResident, deleteResident } = useResidents();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleAddResident = async (data: any) => {
    await addResident(data);
    setIsFormOpen(false);
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

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resident as any).nursing_home_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || resident.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      active: 'default',
      discharged: 'secondary',
      deceased: 'destructive',
      temporary_leave: 'outline'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
  };

  const getCareLevel = (level: string) => {
    return level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Calculate statistics
  const stats = {
    total: residents.length,
    active: residents.filter(r => r.status === 'active').length,
    discharged: residents.filter(r => r.status === 'discharged').length,
    temporaryLeave: residents.filter(r => r.status === 'temporary_leave').length,
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resident Management</h1>
          <p className="text-muted-foreground">Manage residents across all facilities</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-healthcare-primary hover:bg-healthcare-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Resident
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discharged</CardTitle>
            <UserX className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.discharged}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.temporaryLeave}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Residents</CardTitle>
          <CardDescription>
            Comprehensive list of all residents across facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search residents or facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
                <SelectItem value="temporary_leave">Temporary Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Residents Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Care Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' ? 'No residents match your filters.' : 'No residents found. Add your first resident to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell className="font-medium">
                        {resident.first_name} {resident.last_name}
                      </TableCell>
                      <TableCell>{getAge(resident.date_of_birth)}</TableCell>
                      <TableCell>{(resident as any).nursing_home_name || 'Unknown'}</TableCell>
                      <TableCell>{resident.room_number || 'Not assigned'}</TableCell>
                      <TableCell>{getCareLevel(resident.care_level)}</TableCell>
                      <TableCell>{getStatusBadge(resident.status)}</TableCell>
                      <TableCell>${resident.monthly_fee.toLocaleString()}</TableCell>
                      <TableCell>{new Date(resident.admission_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingResident(resident)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteResident(resident.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Resident Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Resident</DialogTitle>
          </DialogHeader>
          <ResidentForm
            onSubmit={handleAddResident}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Resident Dialog */}
      <Dialog open={!!editingResident} onOpenChange={() => setEditingResident(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
          </DialogHeader>
          {editingResident && (
            <ResidentForm
              resident={editingResident}
              onSubmit={handleEditResident}
              onCancel={() => setEditingResident(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
