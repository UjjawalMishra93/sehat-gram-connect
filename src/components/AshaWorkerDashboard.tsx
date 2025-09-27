import { useState } from 'react';
import { Plus, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { t } from '@/utils/translations';
import { calculateTriageScore, getUrgencyLabel, getUrgencyColor } from '@/utils/triage';
import { Patient, Language, Medicine } from '@/types';

interface AshaWorkerDashboardProps {
  language: Language;
  patients: Patient[];
  medicines: Medicine[];
  networkOnline: boolean;
  onAddPatient: (patient: Omit<Patient, 'id' | 'timestamp' | 'synced'>) => void;
}

export default function AshaWorkerDashboard({
  language,
  patients,
  medicines,
  networkOnline,
  onAddPatient
}: AshaWorkerDashboardProps) {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'male' as const,
    village: '',
    symptoms: [] as string[],
    ashaWorker: 'ASHA Worker 1'
  });

  const symptomOptions = [
    'chest_pain', 'difficulty_breathing', 'severe_bleeding', 'unconscious',
    'severe_headache', 'high_fever', 'moderate_pain', 'persistent_cough',
    'nausea', 'dizziness', 'rash', 'fatigue', 'mild_pain', 'cold_symptoms',
    'minor_cut', 'mild_headache', 'stomach_ache'
  ];

  const handleSubmit = () => {
    if (!newPatient.name || !newPatient.age || !newPatient.village) return;
    
    const urgencyScore = calculateTriageScore(newPatient.symptoms);
    
    onAddPatient({
      ...newPatient,
      age: parseInt(newPatient.age),
      urgencyScore
    });
    
    setNewPatient({
      name: '',
      age: '',
      gender: 'male',
      village: '',
      symptoms: [],
      ashaWorker: 'ASHA Worker 1'
    });
    setShowAddPatient(false);
  };

  const toggleSymptom = (symptom: string) => {
    setNewPatient(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const unsyncedCount = patients.filter(p => !p.synced).length;
  const criticalMedicines = medicines.filter(m => m.critical && m.stock < 10);

  return (
    <div className="p-6 bg-main-background min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold">{t('patients', language)}</CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-text">{patients.length}</div>
            <p className="text-muted-foreground">
              {unsyncedCount} {language === 'en' ? 'pending sync' : 'सिंक बाकी'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold">{t('medicines', language)}</CardTitle>
            <AlertTriangle className="h-6 w-6 text-medium-urgency" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-text">{medicines.length}</div>
            <p className="text-muted-foreground">
              {criticalMedicines.length} {language === 'en' ? 'critical low' : 'अत्यंत कम'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-extrabold">
              {language === 'en' ? 'Network Status' : 'नेटवर्क स्थिति'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              className={`text-lg px-3 py-1 ${
                networkOnline ? 'bg-low-urgency-bg text-low-urgency' : 'bg-high-urgency-bg text-high-urgency'
              }`}
            >
              {t(networkOnline ? 'online' : 'offline', language)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{language === 'en' ? 'Add New Patient' : 'नया मरीज़ जोड़ें'}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">
                {language === 'en' ? 'Add New Patient' : 'नया मरीज़ जोड़ें'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-lg font-medium">
                    {t('patientName', language)}
                  </Label>
                  <Input
                    id="name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-lg font-medium">
                    {t('age', language)}
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                    className="text-lg"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="village" className="text-lg font-medium">
                  {t('village', language)}
                </Label>
                <Input
                  id="village"
                  value={newPatient.village}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, village: e.target.value }))}
                  className="text-lg"
                />
              </div>
              
              <div>
                <Label className="text-lg font-medium mb-3 block">
                  {t('symptoms', language)}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {symptomOptions.map(symptom => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={newPatient.symptoms.includes(symptom)}
                        onCheckedChange={() => toggleSymptom(symptom)}
                      />
                      <label htmlFor={symptom} className="text-base">
                        {t(`symptoms_list.${symptom}`, language)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {newPatient.symptoms.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <Label className="text-lg font-medium">
                    {t('urgencyScore', language)}:
                  </Label>
                  <div className="mt-2">
                    <Badge className={`text-lg px-3 py-1 bg-${getUrgencyColor(calculateTriageScore(newPatient.symptoms))}-bg text-${getUrgencyColor(calculateTriageScore(newPatient.symptoms))}`}>
                      {getUrgencyLabel(calculateTriageScore(newPatient.symptoms), language)}
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {t('save', language)}
                </Button>
                <Button variant="outline" onClick={() => setShowAddPatient(false)} className="flex-1">
                  {t('cancel', language)}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Patients */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-neutral-text">
          {language === 'en' ? 'Recent Patients' : 'हाल के मरीज़'}
        </h2>
        
        {patients.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-xl text-muted-foreground">
              {language === 'en' ? 'No patients added yet' : 'अभी तक कोई मरीज़ नहीं जोड़ा गया'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {patients.slice(-5).reverse().map(patient => (
              <Card key={patient.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-extrabold text-neutral-text">
                        {patient.name}
                      </h3>
                      <Badge className={`bg-${getUrgencyColor(patient.urgencyScore)}-bg text-${getUrgencyColor(patient.urgencyScore)}`}>
                        {getUrgencyLabel(patient.urgencyScore, language)}
                      </Badge>
                      {!patient.synced && (
                        <Badge variant="outline" className="text-medium-urgency border-medium-urgency">
                          {language === 'en' ? 'Pending Sync' : 'सिंक बाकी'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {language === 'en' ? 'Age' : 'उम्र'}: {patient.age} | 
                      {language === 'en' ? ' Village' : ' गांव'}: {patient.village}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {patient.symptoms.map(s => t(`symptoms_list.${s}`, language)).join(', ')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}