
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNursingHomes } from '@/hooks/useNursingHomes';
import { useResidents } from '@/hooks/useResidents';

export interface TransactionFilters {
  dateRange: {
    from?: Date;
    to?: Date;
  };
  type?: 'income' | 'expense' | 'all';
  status?: 'pending' | 'completed' | 'cancelled' | 'all';
  category?: string;
  nursingHomeId?: string;
  residentId?: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
}

export function TransactionFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: TransactionFiltersProps) {
  const { data: nursingHomes = [] } = useNursingHomes();
  const { data: residents = [] } = useResidents();

  const hasActiveFilters = 
    filters.dateRange.from || 
    filters.dateRange.to || 
    (filters.type && filters.type !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    filters.category ||
    filters.nursingHomeId ||
    filters.residentId;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => 
                      onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, from: date }
                      })
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => 
                      onFiltersChange({
                        ...filters,
                        dateRange: { ...filters.dateRange, to: date }
                      })
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Transaction Type Filter */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => 
                onFiltersChange({
                  ...filters,
                  type: value === 'all' ? undefined : value as 'income' | 'expense'
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => 
                onFiltersChange({
                  ...filters,
                  status: value === 'all' ? undefined : value as 'pending' | 'completed' | 'cancelled'
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nursing Home Filter */}
          <div className="space-y-2">
            <Label>Nursing Home</Label>
            <Select 
              value={filters.nursingHomeId || 'all'} 
              onValueChange={(value) => 
                onFiltersChange({
                  ...filters,
                  nursingHomeId: value === 'all' ? undefined : value,
                  residentId: undefined // Clear resident filter when nursing home changes
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Nursing Homes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Nursing Homes</SelectItem>
                {nursingHomes.map((home) => (
                  <SelectItem key={home.id} value={home.id}>
                    {home.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resident Filter */}
          <div className="space-y-2">
            <Label>Resident</Label>
            <Select 
              value={filters.residentId || 'all'} 
              onValueChange={(value) => 
                onFiltersChange({
                  ...filters,
                  residentId: value === 'all' ? undefined : value
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Residents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Residents</SelectItem>
                {residents
                  .filter(resident => !filters.nursingHomeId || resident.nursing_home_id === filters.nursingHomeId)
                  .map((resident) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.first_name} {resident.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              placeholder="Search category..."
              value={filters.category || ''}
              onChange={(e) => 
                onFiltersChange({
                  ...filters,
                  category: e.target.value || undefined
                })
              }
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
