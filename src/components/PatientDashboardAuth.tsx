import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { t } from '@/utils/translations';
import { calculateTriageScore } from '@/utils/triage';
import { Patient, Medicine, Language, Consultation } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PatientDashboardAuthProps {
  language: Language;
}

export default function PatientDashboardAuth({ language }: PatientDashboardAuthProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState('');
  const [urgencyScore, setUrgencyScore] = useState<number | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medicinesResponse, consultationsResponse] = await Promise.all([
        supabase.from('medicines').select('*').order('name'),
        supabase
          .from('consultations')
          .select('*, doctor:profiles!consultations_doctor_id_fkey(full_name)')
          .eq('patient_id', profile!.user_id)
          .order('created_at', { ascending: false }),
      ]);

      if (medicinesResponse.data) setMedicines(medicinesResponse.data as Medicine[]);
      if (consultationsResponse.data) {
          const formattedConsultations = consultationsResponse.data.map((c: any) => ({
              ...c,
              doctor_name: c.doctor?.full_name || 'N/A',
          }));
          setConsultations(formattedConsultations as Consultation[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomCheck = () => {
    const score = calculateTriageScore(symptoms.split(',').map(s => s.trim()));
    setUrgencyScore(score);
  };
  
  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          // Here you would send the audioBlob to a backend for speech-to-text processing.
          // For demonstration, we'll simulate the AI response.
          setSymptoms('Simulated voice input: I have a fever and a headache');
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        toast({ title: "Microphone Error", description: "Could not access microphone.", variant: "destructive" });
      }
    }
  };

  const getUrgencyDetails = (score: number) => {
    switch (score) {
      case 3:
        return { 
            text: t('highUrgency', language), 
            advice: 'Urgent. Seek medical attention immediately.',
            className: 'bg-red-100 border-red-500 text-red-800' 
        };
      case 2:
        return { 
            text: t('mediumUrgency', language), 
            advice: 'Medium priority. Please consult a doctor soon.',
            className: 'bg-yellow-100 border-yellow-500 text-yellow-800' 
        };
      default:
        return { 
            text: t('lowUrgency', language), 
            advice: 'Low urgency. Self-care advised. Consult if symptoms worsen.',
            className: 'bg-green-100 border-green-500 text-green-800'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <h2 className="text-3xl font-extrabold text-neutral-text">
        {t('patient', language)} Portal: {t('dashboard', language)}
      </h2>

      {/* Quick Symptom Checker */}
      <Card className="p-6 bg-yellow-50">
        <h3 className="text-xl font-extrabold text-neutral-text mb-4">
          Quick Symptom Checker (AI Triage)
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter symptoms or use the mic..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <Button onClick={handleMicClick} variant={isRecording ? "destructive" : "outline"}>
            {isRecording ? 'Stop' : '🎤'}
          </Button>
          <Button onClick={handleSymptomCheck} className="bg-yellow-600 hover:bg-yellow-700">
            Check Symptoms
          </Button>
        </div>
        {urgencyScore !== null && (
          <div className={`mt-4 p-4 rounded-lg border ${getUrgencyDetails(urgencyScore).className}`}>
            <p className="font-bold">Symptoms Entered: {symptoms}</p>
            <p className="text-lg font-extrabold">
              Urgency Score: <span className="text-2xl">{urgencyScore}</span>
            </p>
            <p>{getUrgencyDetails(urgencyScore).advice}</p>
          </div>
        )}
      </Card>

      {/* Medicine Stock Check */}
      <Card className="p-6">
        <h3 className="text-xl font-extrabold text-neutral-text mb-4">
          Medicine Stock Check (Live)
        </h3>
        <p className="text-red-600 mb-4">Avoid travel if stock is zero. Check stock first.</p>
        <div className="space-y-3 overflow-y-auto h-[200px] pr-2">
          {medicines.map((medicine) => (
            <div key={medicine.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-neutral-text">
                  {language === 'en' ? medicine.name : medicine.name_hi}
                </p>
              </div>
              <Badge variant={medicine.stock > 0 ? 'default' : 'destructive'}>
                Stock: {medicine.stock}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* My Digital Health Records (DHR) */}
      <Card className="p-6">
        <h3 className="text-xl font-extrabold text-neutral-text mb-4">
          My Digital Health Records (DHR)
        </h3>
        <div className="space-y-4">
            <h4 className="font-bold">Latest Consultation</h4>
            {consultations.length > 0 ? (
                <div className="p-4 bg-muted rounded-lg">
                    <p><strong>Doctor:</strong> {consultations[0].doctor_name}</p>
                    <p><strong>Date:</strong> {new Date(consultations[0].created_at).toLocaleDateString()}</p>
                    <p><strong>Notes:</strong> {consultations[0].notes}</p>
                    <p><strong>Prescription:</strong> {consultations[0].prescription}</p>
                </div>
            ) : (
                <p>No recent consultations found.</p>
            )}
        </div>
        {consultations.length > 1 && (
             <Button variant="link" className="mt-4">View all records</Button>
        )}
      </Card>
    </main>
  );
}
