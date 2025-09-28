-- Seed database with comprehensive dummy data
-- This migration ensures that at least one ASHA worker and one doctor exist,
-- and then populates the patients table with a variety of cases.

-- Function to safely insert a user and their profile
CREATE OR REPLACE FUNCTION private.ensure_user_and_profile(
  email TEXT,
  password TEXT,
  role TEXT,
  display_name TEXT
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Check if a user with this email already exists
  SELECT id INTO user_id FROM auth.users WHERE auth.users.email = $1;

  -- If not, create the user
  IF user_id IS NULL THEN
    INSERT INTO auth.users (email, encrypted_password, role, raw_user_meta_data)
    VALUES (email, crypt(password, gen_salt('bf')), 'authenticated', json_build_object('role', role, 'display_name', display_name))
    RETURNING id INTO user_id;

    -- The handle_new_user trigger will create the profile, so we don't need to do it here.
    RAISE NOTICE 'Created user: %', email;
  ELSE
    RAISE NOTICE 'User % already exists', email;
  END IF;

  -- Ensure role is correctly set in profiles table, as triggers can be tricky
  UPDATE public.profiles
  SET role = $3
  WHERE public.profiles.user_id = user_id;

  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Main seeding logic
DO $$
DECLARE
  asha_user_id UUID;
  doctor_user_id UUID;
BEGIN
  -- 1. Ensure at least one ASHA worker and one Doctor exist
  asha_user_id := private.ensure_user_and_profile('asha.worker@sehatgram.org', 'password123', 'asha', 'Asha Worker');
  doctor_user_id := private.ensure_user_and_profile('doctor.user@sehatgram.org', 'password123', 'doctor', 'Dr. Vishal');

  -- 2. Clear out any existing patient data to prevent duplicates
  RAISE NOTICE 'Clearing existing patient data...';
  DELETE FROM public.patients;

  -- 3. Insert new dummy patient data with varied priorities
  RAISE NOTICE 'Inserting new dummy patient data...';
  INSERT INTO public.patients (name, age, gender, village, symptoms, urgency_score, asha_worker_id, synced) VALUES
  -- Urgent Cases (Priority 3)
  ('Amit Patel', 45, 'male', 'Sitapur', '{"Chest Pain", "Shortness of breath"}', 3, asha_user_id, true),
  ('Geeta Singh', 51, 'female', 'Krishnanagar', '{"High fever", "Chills", "Sweating"}', 3, asha_user_id, true),
  ('Vikram Rathore', 55, 'male', 'Jayanagar', '{"Persistent cough", "Weight loss"}', 3, asha_user_id, true),
  ('Kavita Reddy', 29, 'female', 'Narayanpur', '{"Abdominal cramps", "Diarrhea"}', 3, asha_user_id, true),
  ('Arun Kumar', 65, 'male', 'Bishnupur', '{"Swelling in ankles", "Fatigue"}', 3, asha_user_id, true),

  -- Moderate Cases (Priority 2)
  ('Priya Sharma', 34, 'female', 'Rampur', '{"Fever", "Cough", "Headache"}', 2, asha_user_id, true),
  ('Rajesh Kumar', 28, 'male', 'Madhavpur', '{"Stomach ache", "Vomiting"}', 2, asha_user_id, true),
  ('Meena Kumari', 70, 'female', 'Shantipur', '{"Dizziness", "Blurred vision"}', 2, asha_user_id, true),
  ('Ravi Yadav', 31, 'male', 'Durgapur', '{"Sore throat", "Difficulty swallowing"}', 2, asha_user_id, true),
  ('Pooja Mishra', 36, 'female', 'Haripur', '{"Muscle weakness", "Tingling sensation"}', 2, asha_user_id, true),

  -- Low Priority Cases (Priority 1)
  ('Sunita Devi', 62, 'female', 'Govindpur', '{"Joint pain", "Fatigue"}', 1, asha_user_id, true),
  ('Sanjay Verma', 39, 'male', 'Ramgarh', '{"Back pain", "Numbness in legs"}', 1, asha_user_id, true),
  ('Anita Bai', 42, 'female', 'Lakshmipur', '{"Skin rash", "Itching"}', 1, asha_user_id, true),
  ('Manish Das', 48, 'male', 'Gopalganj', '{"Frequent urination", "Thirst"}', 1, asha_user_id, true),
  ('Deepa Iyer', 58, 'female', 'Chennaipatna', '{"Memory loss", "Confusion"}', 1, asha_user_id, true);

  RAISE NOTICE 'Seeding complete! You can now log in with:
  - Doctor: doctor.user@sehatgram.org (password: password123)
  - ASHA Worker: asha.worker@sehatgram.org (password: password123)';

END $$;
