
-- Create a table for residents
CREATE TABLE public.residents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nursing_home_id uuid REFERENCES public.nursing_homes(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone_number text,
  emergency_contact_name text NOT NULL,
  emergency_contact_phone text NOT NULL,
  emergency_contact_relationship text NOT NULL,
  medical_conditions text[],
  medications text[],
  dietary_restrictions text[],
  mobility_level text NOT NULL CHECK (mobility_level IN ('independent', 'assisted', 'wheelchair', 'bedridden')),
  care_level text NOT NULL CHECK (care_level IN ('independent', 'assisted_living', 'memory_care', 'skilled_nursing')),
  admission_date date NOT NULL,
  room_number text,
  monthly_fee numeric(10,2) NOT NULL,
  insurance_provider text,
  insurance_policy_number text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'deceased', 'temporary_leave')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add trigger to update updated_at column
CREATE TRIGGER update_residents_updated_at
  BEFORE UPDATE ON public.residents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_residents_nursing_home_id ON public.residents(nursing_home_id);
CREATE INDEX idx_residents_status ON public.residents(status);
CREATE INDEX idx_residents_admission_date ON public.residents(admission_date);
