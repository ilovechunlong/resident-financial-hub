
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { NursingHome, NursingHomeFormData } from '@/types/nursingHome';

const nursingHomeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(5, 'Valid zip code is required'),
  phone_number: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['active', 'inactive', 'maintenance']),
  administrator: z.string().min(1, 'Administrator is required'),
  license_number: z.string().min(1, 'License number is required'),
  accreditation: z.string().optional(),
  specialties: z.array(z.string()),
  amenities: z.array(z.string()),
  description: z.string().optional(),
  monthly_rate: z.number().min(0, 'Monthly rate cannot be negative'),
});

interface NursingHomeFormProps {
  initialData?: NursingHome;
  onSubmit: (data: NursingHomeFormData) => void;
  onCancel: () => void;
}

export function NursingHomeForm({ initialData, onSubmit, onCancel }: NursingHomeFormProps) {
  const form = useForm<NursingHomeFormData>({
    resolver: zodResolver(nursingHomeSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      address: initialData.address,
      city: initialData.city,
      state: initialData.state,
      zip_code: initialData.zip_code,
      phone_number: initialData.phone_number,
      email: initialData.email,
      capacity: initialData.capacity,
      status: initialData.status,
      administrator: initialData.administrator,
      license_number: initialData.license_number,
      accreditation: initialData.accreditation,
      specialties: initialData.specialties,
      amenities: initialData.amenities,
      description: initialData.description,
      monthly_rate: initialData.monthly_rate,
    } : {
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone_number: '',
      email: '',
      capacity: 0,
      status: 'active',
      administrator: '',
      license_number: '',
      accreditation: '',
      specialties: [],
      amenities: [],
      description: '',
      monthly_rate: 0,
    }
  });

  const handleSubmit = (data: NursingHomeFormData) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{initialData ? 'Edit Nursing Home' : 'Add New Nursing Home'}</CardTitle>
            <CardDescription>
              {initialData ? 'Update nursing home information' : 'Enter details for the new nursing home'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter facility name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="administrator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Administrator</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter administrator name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address</h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter zip code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Capacity and Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Facility Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthly_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Rate ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* License Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">License & Accreditation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter license number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accreditation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accreditation (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter accreditation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter facility description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  {initialData ? 'Update' : 'Create'} Nursing Home
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
