
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PersonalInfoStepProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function PersonalInfoStep({ formData, updateFormData }: PersonalInfoStepProps) {
  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please provide the resident's basic personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => updateFormData({ first_name: e.target.value })}
            placeholder="Enter first name"
            required
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => updateFormData({ last_name: e.target.value })}
            placeholder="Enter last name"
            required
          />
        </div>

        <div>
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => updateFormData({ date_of_birth: e.target.value })}
            required
          />
          {formData.date_of_birth && (
            <p className="text-sm text-gray-500 mt-1">
              Age: {getAge(formData.date_of_birth)} years old
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => updateFormData({ phone_number: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="social_security_number">Social Security Number</Label>
          <Input
            id="social_security_number"
            type="password"
            value={formData.social_security_number}
            onChange={(e) => updateFormData({ social_security_number: e.target.value })}
            placeholder="XXX-XX-XXXX"
          />
          <p className="text-xs text-gray-500 mt-1">
            This information is encrypted and securely stored.
          </p>
        </div>
      </div>
    </div>
  );
}
