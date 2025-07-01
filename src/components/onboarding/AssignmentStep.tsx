
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NursingHome } from '@/types/nursingHome';

interface AssignmentStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  nursingHomes: NursingHome[];
}

export function AssignmentStep({ formData, updateFormData, nursingHomes }: AssignmentStepProps) {
  const selectedHome = nursingHomes.find(home => home.id === formData.nursing_home_id);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Nursing Home Assignment</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select the nursing home where this resident will be placed and configure their care details.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="nursing_home_id">Nursing Home *</Label>
          <Select
            value={formData.nursing_home_id}
            onValueChange={(value) => updateFormData({ nursing_home_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select nursing home" />
            </SelectTrigger>
            <SelectContent>
              {nursingHomes.map((home) => (
                <SelectItem key={home.id} value={home.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{home.name}</span>
                    <span className="text-sm text-gray-500">{home.city}, {home.state}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedHome && (
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-3">Selected Facility Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Administrator:</span>
                  <p className="font-medium">{selectedHome.administrator}</p>
                </div>
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <p className="font-medium">{selectedHome.capacity} residents</p>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium">{selectedHome.address}</p>
                  <p className="font-medium">{selectedHome.city}, {selectedHome.state} {selectedHome.zip_code}</p>
                </div>
                <div>
                  <span className="text-gray-600">Contact:</span>
                  <p className="font-medium">{selectedHome.phone_number}</p>
                  <p className="font-medium">{selectedHome.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="care_level">Care Level</Label>
            <Select
              value={formData.care_level}
              onValueChange={(value) => updateFormData({ care_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select care level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="independent">Independent Living</SelectItem>
                <SelectItem value="assisted_living">Assisted Living</SelectItem>
                <SelectItem value="memory_care">Memory Care</SelectItem>
                <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mobility_level">Mobility Level</Label>
            <Select
              value={formData.mobility_level}
              onValueChange={(value) => updateFormData({ mobility_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mobility level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="independent">Independent</SelectItem>
                <SelectItem value="assisted">Assisted</SelectItem>
                <SelectItem value="wheelchair">Wheelchair</SelectItem>
                <SelectItem value="bedridden">Bedridden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="room_number">Room Number</Label>
            <Input
              id="room_number"
              value={formData.room_number}
              onChange={(e) => updateFormData({ room_number: e.target.value })}
              placeholder="e.g., 101A"
            />
          </div>

          <div>
            <Label htmlFor="admission_date">Admission Date</Label>
            <Input
              id="admission_date"
              type="date"
              value={formData.admission_date}
              onChange={(e) => updateFormData({ admission_date: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
