
-- Create nursing_homes table with all necessary fields
CREATE TABLE public.nursing_homes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  current_residents INTEGER NOT NULL DEFAULT 0 CHECK (current_residents >= 0),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance')),
  administrator TEXT NOT NULL,
  license_number TEXT NOT NULL,
  accreditation TEXT,
  specialties TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  description TEXT,
  monthly_rate INTEGER NOT NULL CHECK (monthly_rate >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraint to ensure current_residents doesn't exceed capacity
ALTER TABLE public.nursing_homes 
ADD CONSTRAINT check_current_residents_capacity 
CHECK (current_residents <= capacity);

-- Create an index on name for faster searches
CREATE INDEX idx_nursing_homes_name ON public.nursing_homes(name);

-- Create an index on status for filtering
CREATE INDEX idx_nursing_homes_status ON public.nursing_homes(status);

-- Enable Row Level Security (making it public for now since no auth is implemented)
ALTER TABLE public.nursing_homes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (since no authentication)
CREATE POLICY "Allow all operations on nursing_homes" 
  ON public.nursing_homes 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_nursing_homes_updated_at 
  BEFORE UPDATE ON public.nursing_homes 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
