import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import RoleSelector from '@/components/RoleSelector';
import Header from '@/components/Header';
import AshaWorkerDashboard from '@/components/AshaWorkerDashboard';
import DoctorDashboard from '@/components/DoctorDashboard';
import PharmacyDashboard from '@/components/PharmacyDashboard';
import { UserRole, Language, Patient, Medicine, AppState } from '@/types';

// Mock initial data
const initialMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    nameHi: 'पेरासिटामोल',
    stock: 45,
    critical: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Amoxicillin',
    nameHi: 'एमोक्सिसिलिन',
    stock: 8,
    critical: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    name: 'ORS Sachets',
    nameHi: 'ओआरएस पाउडर',
    stock: 120,
    critical: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Iron Tablets',
    nameHi: 'आयरन की गोलियां',
    stock: 25,
    critical: false,
    lastUpdated: new Date().toISOString()
  }
];

const Index = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: {
      role: 'asha',
      name: '',
      id: 'user-1'
    },
    language: 'en',
    networkStatus: {
      online: true,
      lastSync: new Date().toISOString()
    },
    patients: [],
    medicines: initialMedicines,
    pendingSync: []
  });

  const [showRoleSelector, setShowRoleSelector] = useState(true);

  // Simulated offline sync functionality
  useEffect(() => {
    const syncData = () => {
      if (appState.networkStatus.online && appState.pendingSync.length > 0) {
        setAppState(prev => ({
          ...prev,
          patients: prev.patients.map(p => ({ ...p, synced: true })),
          pendingSync: [],
          networkStatus: {
            ...prev.networkStatus,
            lastSync: new Date().toISOString()
          }
        }));
        toast({
          title: "Sync Complete",
          description: `${appState.pendingSync.length} records synced successfully`
        });
      }
    };

    if (appState.networkStatus.online) {
      const timer = setTimeout(syncData, 2000);
      return () => clearTimeout(timer);
    }
  }, [appState.networkStatus.online, appState.pendingSync.length]);

  const handleRoleSelect = (role: UserRole) => {
    const names = {
      asha: 'ASHA Worker',
      doctor: 'Dr. Sharma',
      pharmacy: 'Pharmacy Staff',
      patient: 'Patient'
    };

    setAppState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        role,
        name: names[role]
      }
    }));
    setShowRoleSelector(false);
  };

  const handleLanguageToggle = () => {
    setAppState(prev => ({
      ...prev,
      language: prev.language === 'en' ? 'hi' : 'en'
    }));
  };

  const handleNetworkToggle = () => {
    setAppState(prev => ({
      ...prev,
      networkStatus: {
        ...prev.networkStatus,
        online: !prev.networkStatus.online
      }
    }));
  };

  const handleSync = () => {
    if (!appState.networkStatus.online) {
      setAppState(prev => ({
        ...prev,
        networkStatus: {
          ...prev.networkStatus,
          online: true
        }
      }));
    }
  };

  const handleAddPatient = (newPatient: Omit<Patient, 'id' | 'timestamp' | 'synced'>) => {
    const patient: Patient = {
      ...newPatient,
      id: `patient-${Date.now()}`,
      timestamp: new Date().toISOString(),
      synced: appState.networkStatus.online
    };

    setAppState(prev => ({
      ...prev,
      patients: [...prev.patients, patient],
      pendingSync: prev.networkStatus.online 
        ? prev.pendingSync 
        : [...prev.pendingSync, patient]
    }));

    toast({
      title: appState.language === 'en' ? "Patient Added" : "मरीज़ जोड़ा गया",
      description: appState.networkStatus.online 
        ? (appState.language === 'en' ? "Patient data saved successfully" : "मरीज़ का डेटा सफलतापूर्वक सेव हुआ")
        : (appState.language === 'en' ? "Patient saved locally. Will sync when online." : "मरीज़ स्थानीय रूप से सेव हुआ। ऑनलाइन होने पर सिंक होगा।")
    });
  };

  const handleUpdateStock = (medicineId: string, newStock: number) => {
    setAppState(prev => ({
      ...prev,
      medicines: prev.medicines.map(m => 
        m.id === medicineId 
          ? { ...m, stock: newStock, lastUpdated: new Date().toISOString() }
          : m
      )
    }));

    toast({
      title: appState.language === 'en' ? "Stock Updated" : "स्टॉक अपडेट हुआ",
      description: appState.language === 'en' 
        ? "Medicine stock updated successfully" 
        : "दवा का स्टॉक सफलतापूर्वक अपडेट हुआ"
    });
  };

  if (showRoleSelector) {
    return <RoleSelector onRoleSelect={handleRoleSelect} language={appState.language} />;
  }

  const renderDashboard = () => {
    switch (appState.currentUser.role) {
      case 'asha':
        return (
          <AshaWorkerDashboard
            language={appState.language}
            patients={appState.patients}
            medicines={appState.medicines}
            networkOnline={appState.networkStatus.online}
            onAddPatient={handleAddPatient}
          />
        );
      case 'doctor':
        return (
          <DoctorDashboard
            language={appState.language}
            patients={appState.patients.filter(p => p.synced)}
          />
        );
      case 'pharmacy':
        return (
          <PharmacyDashboard
            language={appState.language}
            medicines={appState.medicines}
            onUpdateStock={handleUpdateStock}
          />
        );
      default:
        return (
          <div className="p-6 bg-main-background min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-neutral-text mb-4">
                {appState.language === 'en' ? 'Patient Dashboard Coming Soon' : 'मरीज़ डैशबोर्ड जल्द आ रहा है'}
              </h2>
              <p className="text-xl text-muted-foreground">
                {appState.language === 'en' 
                  ? 'Patient features will be available in the next version'
                  : 'मरीज़ की सुविधाएं अगले संस्करण में उपलब्ध होंगी'
                }
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-main-background">
      <Header
        userRole={appState.currentUser.role}
        userName={appState.currentUser.name}
        language={appState.language}
        networkStatus={appState.networkStatus}
        onLanguageToggle={handleLanguageToggle}
        onNetworkToggle={handleNetworkToggle}
        onSync={handleSync}
      />
      {renderDashboard()}
    </div>
  );
};

export default Index;