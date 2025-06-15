import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NursingHome } from '@/types/nursingHome';

interface ReviewStepProps {
  formData: any;
  nursingHomes: NursingHome[];
}

export function ReviewStep({ formData, nursingHomes }: ReviewStepProps) {
  const selectedHome = nursingHomes.find(home => home.id === formData.nursing_home_id);

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getDisplayName = (typeId: string) => {
    // Custom income types are no longer supported, so no special formatting is needed.
    return typeId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please review all the information below before completing the onboarding process.
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Full Name:</span>
                <p className="font-medium">{formData.first_name} {formData.last_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Age:</span>
                <p className="font-medium">{getAge(formData.date_of_birth)} years old</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Date of Birth:</span>
                <p className="font-medium">{new Date(formData.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Gender:</span>
                <p className="font-medium capitalize">{formData.gender}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Phone:</span>
                <p className="font-medium">{formData.phone_number || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">SSN:</span>
                <p className="font-medium">***-**-{formData.social_security_number?.slice(-4) || '****'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Contact Name:</span>
                <p className="font-medium">{formData.emergency_contact_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Relationship:</span>
                <p className="font-medium">{formData.emergency_contact_relationship}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Phone Number:</span>
                <p className="font-medium">{formData.emergency_contact_phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nursing Home Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Facility:</span>
                <p className="font-medium">{selectedHome?.name}</p>
                <p className="text-sm text-gray-500">{selectedHome?.city}, {selectedHome?.state}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Administrator:</span>
                <p className="font-medium">{selectedHome?.administrator}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Care Level:</span>
                <p className="font-medium capitalize">{formData.care_level?.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Mobility Level:</span>
                <p className="font-medium capitalize">{formData.mobility_level}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Room Number:</span>
                <p className="font-medium">{formData.room_number || 'To be assigned'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Admission Date:</span>
                <p className="font-medium">{new Date(formData.admission_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Income Types:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.income_types?.map((typeId: string) => (
                  <Badge key={typeId} variant="secondary">
                    {getDisplayName(typeId)}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-sm text-gray-600">Insurance Provider:</span>
                <p className="font-medium">{formData.insurance_provider || 'Not provided'}</p>
              </div>
              {formData.insurance_policy_number && (
                <div>
                  <span className="text-sm text-gray-600">Policy Number:</span>
                  <p className="font-medium">{formData.insurance_policy_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-green-800 font-medium mb-2">Ready to Complete Onboarding</h4>
        <p className="text-green-700 text-sm">
          All required information has been provided. Click "Complete Onboarding" to add this resident to the system.
        </p>
      </div>
    </div>
  );
}
