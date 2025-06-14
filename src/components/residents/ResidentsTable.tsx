
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Resident } from '@/types/resident';

interface ResidentsTableProps {
  residents: Resident[];
  onEditResident: (resident: Resident) => void;
  onDeleteResident: (id: string) => void;
  searchTerm: string;
  statusFilter: string;
}

export function ResidentsTable({ 
  residents, 
  onEditResident, 
  onDeleteResident, 
  searchTerm, 
  statusFilter 
}: ResidentsTableProps) {
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

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resident as any).nursing_home_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || resident.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
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
                      onClick={() => onEditResident(resident)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteResident(resident.id)}
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
  );
}
