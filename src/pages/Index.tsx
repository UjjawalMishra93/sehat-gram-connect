import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AshaWorkerDashboardAuth from '@/components/AshaWorkerDashboardAuth';
import DoctorDashboardAuth from '@/components/DoctorDashboardAuth';
import PharmacyDashboardAuth from '@/components/PharmacyDashboardAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Language } from '@/types';
import { useState } from 'react';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-main-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to access Sehat-Gram</p>
          <Button onClick={() => navigate('/auth')}>
            Go to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'asha':
        return <AshaWorkerDashboardAuth language={language} />;
      case 'doctor':
        return <DoctorDashboardAuth language={language} />;
      case 'pharmacy':
        return <PharmacyDashboardAuth language={language} />;
      default:
        return (
          <div className="p-6 bg-main-background min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-neutral-text mb-4">
                {language === 'en' ? 'Patient Dashboard Coming Soon' : 'मरीज़ डैशबोर्ड जल्द आ रहा है'}
              </h2>
              <p className="text-xl text-muted-foreground">
                {language === 'en' 
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
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-extrabold text-primary">Sehat-Gram</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {profile.display_name || user.email}
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {profile.role.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLanguageToggle}
              >
                {language === 'en' ? 'हिंदी' : 'English'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {renderDashboard()}
    </div>
  );
};

export default Index;