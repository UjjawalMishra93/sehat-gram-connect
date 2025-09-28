INSERT INTO public.consultations (patient_id, doctor_id, notes, prescription) 
SELECT 
    p.user_id AS patient_id,
    d.user_id AS doctor_id,
    'Routine check-up, patient reports feeling well. Advised to continue with current medication and lifestyle.' AS notes,
    'Vitamin D supplements' AS prescription
FROM 
    public.profiles p
JOIN 
    public.profiles d ON d.role = 'doctor'
WHERE 
    p.role = 'patient'
LIMIT 1;
