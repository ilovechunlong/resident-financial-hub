
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

  const getDisplayName = (typeId: string) => {
    const incomeTypes = [
      { id: 'ssi', label: 'SSI (Supplemental Security Income)' },
      { id: 'ssdi', label: 'SSDI (Social Security Disability Insurance)' },
      { id: 'grant', label: 'Grant' },
      { id: 'waiver', label: 'Waiver' },
      { id: 'pension', label: 'Pension' },
      { id: 'family_support', label: 'Family Support' },
      { id: 'other', label: 'Other' },
    ];

    const standardType = incomeTypes.find(type => type.id === typeId);
    if (standardType) return standardType.label;
    
    if (typeId.startsWith('custom_')) {
      return typeId.replace('custom_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return typeId;
  };

  const formatIncomeTypes = (incomeTypes: string[] | undefined) => {
    if (!incomeTypes || incomeTypes.length === 0) {
      return 'Not specified';
    }
    
    return incomeTypes.map(type => getDisplayName(type)).join(', ');
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
            <TableHead>Facility</TableHead>
            <TableHead>Emergency Contact</TableHead>
            <TableHead>Income Types</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredResidents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? 'No residents match your filters.' : 'No residents found. Add your first resident to get started.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredResidents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell className="font-medium">
                  {resident.first_name} {resident.last_name}
                </TableCell>
                <TableCell>{(resident as any).nursing_home_name || 'Unknown'}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{resident.emergency_contact_name}</div>
                    <div className="text-sm text-gray-600">{resident.emergency_contact_phone}</div>
                    <div className="text-xs text-gray-500">{resident.emergency_contact_relationship}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatIncomeTypes(resident.income_types)}
                  </div>
                </TableCell>
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
