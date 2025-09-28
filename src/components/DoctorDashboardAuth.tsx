import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/utils/translations';
import { Patient, Language } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface DoctorDashboardAuthProps {
  language: Language;
}

export default function DoctorDashboardAuth({ language }: DoctorDashboardAuthProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('synced', true)
        .order('urgency_score', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPatients(data as Patient[]);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoCall = (patientId: string) => {
    alert(`Starting video consultation with patient ${patientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  const urgentPatients = patients.filter(p => p.urgency_score === 3);
  const moderatePatients = patients.filter(p => p.urgency_score === 2);
  const lowPriorityPatients = patients.filter(p => p.urgency_score === 1);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-neutral-text">
          {t('doctor', language)} Dashboard
        </h2>
        
        <div className="flex items-center gap-4">
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {urgentPatients.length} Urgent
          </Badge>
          <Badge variant="default" className="text-lg px-3 py-1">
            {moderatePatients.length} Moderate
          </Badge>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {lowPriorityPatients.length} Low Priority
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col">
          <h3 className="text-xl font-extrabold text-red-600 mb-4 flex items-center gap-2">
            🚨 {language === 'en' ? 'Urgent Cases' : 'अत्यावश्यक मामले'}
          </h3>
          
          <div className="space-y-3 overflow-y-auto h-[400px] pr-2 thin-scrollbar">
            {urgentPatients.map((patient) => (
              <div key={patient.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-neutral-text">{patient.name}</p>
                  <Badge variant="destructive">Priority 3</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {patient.age} years • {patient.village}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Symptoms: {patient.symptoms.join(', ')}
                </p>
                <Button 
                  onClick={() => handleVideoCall(patient.id)}
                  size="sm" 
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  📹 {language === 'en' ? 'Start Video Call' : 'वीडियो कॉल शुरू करें'}
                </Button>
              </div>
            ))}
            
            {urgentPatients.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {language === 'en' ? 'No urgent cases' : 'कोई अत्यावश्यक मामले नहीं'}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="text-xl font-extrabold text-orange-600 mb-4 flex items-center gap-2">
            ⚠️ {language === 'en' ? 'Moderate Cases' : 'मध्यम मामले'}
          </h3>
          
          <div className="space-y-3 overflow-y-auto h-[400px] pr-2 thin-scrollbar">
            {moderatePatients.map((patient) => (
              <div key={patient.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-neutral-text">{patient.name}</p>
                  <Badge variant="default">Priority 2</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {patient.age} years • {patient.village}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Symptoms: {patient.symptoms.join(', ')}
                </p>
                <Button 
                  onClick={() => handleVideoCall(patient.id)}
                  size="sm" 
                  className="w-full"
                >
                  📹 {language === 'en' ? 'Schedule Call' : 'कॉल शेड्यूल करें'}
                </Button>
              </div>
            ))}
            
            {moderatePatients.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {language === 'en' ? 'No moderate cases' : 'कोई मध्यम मामले नहीं'}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="text-xl font-extrabold text-green-600 mb-4 flex items-center gap-2">
            ℹ️ {language === 'en' ? 'Low Priority' : 'कम प्राथमिकता'}
          </h3>
          
          <div className="space-y-3 overflow-y-auto h-[400px] pr-2 thin-scrollbar">
            {lowPriorityPatients.map((patient) => (
              <div key={patient.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-neutral-text">{patient.name}</p>
                  <Badge variant="secondary">Priority 1</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {patient.age} years • {patient.village}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Symptoms: {patient.symptoms.join(', ')}
                </p>
                <Button 
                  onClick={() => handleVideoCall(patient.id)}
                  size="sm" 
                  variant="outline"
                  className="w-full"
                >
                  📹 {language === 'en' ? 'Routine Call' : 'नियमित कॉल'}
                </Button>
              </div>
            ))}
            
            {lowPriorityPatients.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                {language === 'en' ? 'No low priority cases' : 'कोई कम प्राथमिकता के मामले नहीं'}
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-extrabold text-neutral-text mb-4">
          📊 {language === 'en' ? 'Today\'s Summary' : 'आज का सारांश'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-neutral-text">{patients.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Total Patients' : 'कुल मरीज़'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{urgentPatients.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Urgent Cases' : 'अत्यावश्यक'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{moderatePatients.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Moderate Cases' : 'मध्यम'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{lowPriorityPatients.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Low Priority' : 'कम प्राथमिकता'}
            </p>
          </div>
        </div>
      </Card>
    </main>
  );
}
