import { useState } from 'react';
import { Video, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { t } from '@/utils/translations';
import { getUrgencyLabel, getUrgencyColor } from '@/utils/triage';
import { Patient, Language } from '@/types';

interface DoctorDashboardProps {
  language: Language;
  patients: Patient[];
}

export default function DoctorDashboard({ language, patients }: DoctorDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Sort patients by urgency score (highest first)
  const sortedPatients = [...patients].sort((a, b) => b.urgencyScore - a.urgencyScore);
  
  const urgencyStats = {
    high: patients.filter(p => p.urgencyScore === 3).length,
    medium: patients.filter(p => p.urgencyScore === 2).length,
    low: patients.filter(p => p.urgencyScore === 1).length
  };

  const startConsultation = (patient: Patient) => {
    // Simulate video consultation
    alert(`${language === 'en' ? 'Starting video consultation with' : 'वीडियो परामर्श शुरू कर रहे हैं'} ${patient.name}`);
  };

  return (
    <div className="p-6 bg-main-background min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold">
              {language === 'en' ? 'Total Patients' : 'कुल मरीज़'}
            </CardTitle>
            <FileText className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-text">{patients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold text-high-urgency">
              {t('highUrgency', language)}
            </CardTitle>
            <Clock className="h-6 w-6 text-high-urgency" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-high-urgency">{urgencyStats.high}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold text-medium-urgency">
              {t('mediumUrgency', language)}
            </CardTitle>
            <Clock className="h-6 w-6 text-medium-urgency" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-medium-urgency">{urgencyStats.medium}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold text-low-urgency">
              {t('lowUrgency', language)}
            </CardTitle>
            <Clock className="h-6 w-6 text-low-urgency" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-low-urgency">{urgencyStats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Queue */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-neutral-text">
          {language === 'en' ? 'Patient Triage Queue' : 'मरीज़ प्राथमिकीकरण कतार'}
        </h2>
        
        {sortedPatients.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-xl text-muted-foreground">
              {language === 'en' ? 'No patients in queue' : 'कतार में कोई मरीज़ नहीं'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedPatients.map((patient, index) => (
              <Card key={patient.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <h3 className="text-xl font-extrabold text-neutral-text">
                        {patient.name}
                      </h3>
                      <Badge className={`bg-${getUrgencyColor(patient.urgencyScore)}-bg text-${getUrgencyColor(patient.urgencyScore)}`}>
                        {getUrgencyLabel(patient.urgencyScore, language)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(patient.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                      <div>
                        <span className="text-muted-foreground">
                          {language === 'en' ? 'Age:' : 'उम्र:'} 
                        </span> {patient.age}
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {language === 'en' ? 'Village:' : 'गांव:'} 
                        </span> {patient.village}
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {language === 'en' ? 'ASHA:' : 'आशा:'} 
                        </span> {patient.ashaWorker}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-muted-foreground text-lg">
                        {language === 'en' ? 'Symptoms:' : 'लक्षण:'} 
                      </span>
                      <span className="ml-2 text-lg">
                        {patient.symptoms.map(s => t(`symptoms_list.${s}`, language)).join(', ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      onClick={() => startConsultation(patient)}
                      className="flex items-center space-x-2"
                    >
                      <Video className="h-4 w-4" />
                      <span>{t('startConsultation', language)}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPatient(patient)}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{t('viewPatient', language)}</span>
                    </Button>
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