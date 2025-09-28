import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { t } from '@/utils/translations';
import { Patient, Medicine, Language } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AshaWorkerDashboardAuthProps {
  language: Language;
}

export default function AshaWorkerDashboardAuth({ language }: AshaWorkerDashboardAuthProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState<Patient[]>([]);
  
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    village: '',
    symptoms: [] as string[],
    priority: 2,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patientsResponse, medicinesResponse] = await Promise.all([
        supabase.from('patients').select('*').order('created_at', { ascending: false }),
        supabase.from('medicines').select('*').order('name')
      ]);

      if (patientsResponse.data) setPatients(patientsResponse.data as Patient[]);
      if (medicinesResponse.data) setMedicines(medicinesResponse.data as Medicine[]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.village || !profile) return;
    
    const patientData = {
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      village: newPatient.village,
      symptoms: newPatient.symptoms,
      urgency_score: newPatient.priority,
      asha_worker_id: profile.user_id,
      synced: !offline
    };

    if (offline) {
      const localPatient = {
        ...patientData,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      setPendingSync(prev => [...prev, localPatient]);
      
      toast({
        title: language === 'en' ? "Patient Saved Offline" : "मरीज़ ऑफलाइन सेव हुआ",
        description: language === 'en' ? "Will sync when online" : "ऑनलाइन होने पर सिंक होगा"
      });
    } else {
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert(patientData)
          .select()
          .single();

        if (error) throw error;
        
        setPatients(prev => [data as Patient, ...prev]);
        
        toast({
          title: language === 'en' ? "Patient Added" : "मरीज़ जोड़ा गया",
          description: language === 'en' ? "Patient saved successfully" : "मरीज़ सफलतापूर्वक सेव हुआ"
        });
      } catch (error) {
        console.error('Error adding patient:', error);
        toast({
          title: "Error",
          description: "Failed to add patient",
          variant: "destructive"
        });
      }
    }

    setNewPatient({ name: '', age: '', gender: 'male', village: '', symptoms: [], priority: 2 });
  };

  const handleSync = async () => {
    if (pendingSync.length === 0) return;

    try {
      const syncData = pendingSync.map(patient => ({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        village: patient.village,
        symptoms: patient.symptoms,
        urgency_score: patient.urgency_score,
        asha_worker_id: profile!.user_id
      }));

      const { data, error } = await supabase
        .from('patients')
        .insert(syncData)
        .select();

      if (error) throw error;

      setPatients(prev => [...(data || []) as Patient[], ...prev]);
      setPendingSync([]);
      setOffline(false);

      toast({
        title: "Sync Complete",
        description: `${pendingSync.length} patients synced successfully`
      });
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync offline data",
        variant: "destructive"
      });
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    setNewPatient(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const commonSymptoms = [
    { en: 'Fever', hi: 'बुखार' },
    { en: 'Cough', hi: 'खांसी' },
    { en: 'Headache', hi: 'सिरदर्द' },
    { en: 'Vomiting', hi: 'उल्टी' },
    { en: 'Diarrhea', hi: 'दस्त' },
    { en: 'Chest Pain', hi: 'छाती में दर्द' }
  ];

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

  const priorityOptions = [
    { value: 3, label: 'High', color: 'bg-red-500' },
    { value: 2, label: 'Medium', color: 'bg-yellow-500' },
    { value: 1, label: 'Low', color: 'bg-green-500' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-neutral-text">
          {t('ashaWorker', language)} Dashboard
        </h2>
        
        <div className="flex items-center gap-4">
          {pendingSync.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {pendingSync.length} pending sync
            </Badge>
          )}
          
          <Button
            onClick={() => setOffline(!offline)}
            variant={offline ? "destructive" : "outline"}
          >
            {offline ? '📵 Offline' : '📶 Online'}
          </Button>
          
          {pendingSync.length > 0 && (
            <Button onClick={handleSync} className="bg-green-600 hover:bg-green-700">
              Sync Data
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-extrabold text-neutral-text mb-4">
            {language === 'en' ? 'Add New Patient' : 'नया मरीज़ जोड़ें'}
          </h3>
          
          <div className="space-y-4">
            <Input
              placeholder={language === 'en' ? 'Patient Name' : 'मरीज़ का नाम'}
              value={newPatient.name}
              onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={language === 'en' ? 'Age' : 'उम्र'}
                value={newPatient.age}
                onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
              />
              
              <select
                value={newPatient.gender}
                onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.target.value as any }))}
                className="p-2 border rounded-md bg-card text-card-foreground"
              >
                <option value="male">{language === 'en' ? 'Male' : 'पुरुष'}</option>
                <option value="female">{language === 'en' ? 'Female' : 'महिला'}</option>
                <option value="other">{language === 'en' ? 'Other' : 'अन्य'}</option>
              </select>
            </div>
            
            <Input
              placeholder={language === 'en' ? 'Village' : 'गांव'}
              value={newPatient.village}
              onChange={(e) => setNewPatient(prev => ({ ...prev, village: e.target.value }))}
            />
            
            <div>
              <p className="text-sm font-medium text-neutral-text mb-2">
                {language === 'en' ? 'Symptoms' : 'लक्षण'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {commonSymptoms.map((symptom, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSymptomToggle(symptom.en)}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      newPatient.symptoms.includes(symptom.en)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-card-foreground hover:bg-muted'
                    }`}
                  >
                    {language === 'en' ? symptom.en : symptom.hi}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-text mb-2">
                {language === 'en' ? 'Priority' : 'प्राथमिकता'}
              </p>
              <div className="flex space-x-2">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setNewPatient(prev => ({ ...prev, priority: option.value }))}
                    className={`w-full p-2 text-sm rounded-md border transition-colors ${
                      newPatient.priority === option.value
                        ? `${option.color} text-white`
                        : 'bg-card text-card-foreground hover:bg-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <Button onClick={handleAddPatient} className="w-full">
              {language === 'en' ? 'Add Patient' : 'मरीज़ जोड़ें'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="text-xl font-extrabold text-neutral-text mb-4">
            {language === 'en' ? 'Medicine Stock' : 'दवा स्टॉक'}
          </h3>
          
          <div className="space-y-3 overflow-y-auto h-[400px] pr-2">
            {medicines.map((medicine) => (
              <div key={medicine.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-neutral-text">
                    {language === 'en' ? medicine.name : medicine.name_hi}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {medicine.stock}
                  </p>
                </div>
                {medicine.critical && medicine.stock < 20 && (
                  <Badge variant="destructive">Low Stock</Badge>
                )}
              </div>
            ))}\
          </div>
        </Card>
      </div>

      <Card className="p-6 flex flex-col">
        <h3 className="text-xl font-extrabold text-neutral-text mb-4">
          {language === 'en' ? 'Recent Patients' : 'हाल के मरीज़'}
        </h3>
        
        <div className="space-y-3 overflow-y-auto h-[400px] pr-2">
          {[...pendingSync, ...patients].slice(0, 10).map((patient, idx) => (
            <div key={patient.id || idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-neutral-text">{patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.age} years • {patient.village}
                </p>
                <p className="text-sm text-muted-foreground">
                  Symptoms: {patient.symptoms.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={patient.urgency_score === 3 ? "destructive" : 
                          patient.urgency_score === 2 ? "default" : "secondary"}
                >
                  Priority {patient.urgency_score}
                </Badge>
                {!patient.synced && (
                  <Badge variant="outline">Pending</Badge>
                )}\
              </div>
            </div>
          ))}\
        </div>
      </Card>
    </main>
  );
}
