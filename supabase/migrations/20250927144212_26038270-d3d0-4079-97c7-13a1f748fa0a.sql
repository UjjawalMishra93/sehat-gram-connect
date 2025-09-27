-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'asha' CHECK (role IN ('asha', 'doctor', 'pharmacy', 'patient')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'asha')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create patients table for storing patient data
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  village TEXT NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  urgency_score INTEGER NOT NULL CHECK (urgency_score IN (1, 2, 3)),
  asha_worker_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS for patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policies for patients
CREATE POLICY "ASHA workers can view their own patients" 
ON public.patients 
FOR SELECT 
USING (asha_worker_id = auth.uid());

CREATE POLICY "ASHA workers can insert their own patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (asha_worker_id = auth.uid());

CREATE POLICY "ASHA workers can update their own patients" 
ON public.patients 
FOR UPDATE 
USING (asha_worker_id = auth.uid());

CREATE POLICY "Doctors can view all synced patients" 
ON public.patients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'doctor'
  ) AND synced = true
);

-- Create medicines table
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  critical BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for medicines
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Create policies for medicines
CREATE POLICY "Everyone can view medicines" 
ON public.medicines 
FOR SELECT 
USING (true);

CREATE POLICY "Pharmacy staff can update medicines" 
ON public.medicines 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'pharmacy'
  )
);

CREATE POLICY "Pharmacy staff can insert medicines" 
ON public.medicines 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'pharmacy'
  )
);

-- Insert initial medicine data
INSERT INTO public.medicines (name, name_hi, stock, critical) VALUES
('Paracetamol', 'पेरासिटामोल', 45, true),
('Amoxicillin', 'एमोक्सिसिलिन', 8, true),
('ORS Sachets', 'ओआरएस पाउडर', 120, true),
('Iron Tablets', 'आयरन की गोलियां', 25, false);

-- Create trigger for medicine updates
CREATE TRIGGER update_medicines_updated_at
BEFORE UPDATE ON public.medicines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();