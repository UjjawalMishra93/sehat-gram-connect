import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { t } from '@/utils/translations';

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
  language: 'en' | 'hi';
}

export default function RoleSelector({ onRoleSelect, language }: RoleSelectorProps) {
  const roles: { role: UserRole; icon: string; description: string }[] = [
    {
      role: 'asha',
      icon: '👩‍⚕️',
      description: language === 'en' ? 'ASHA Worker - Community Health' : 'आशा कार्यकर्ता - सामुदायिक स्वास्थ्य'
    },
    {
      role: 'doctor',
      icon: '🩺',
      description: language === 'en' ? 'Doctor - Patient Triage' : 'डॉक्टर - मरीज़ प्राथमिकीकरण'
    },
    {
      role: 'pharmacy',
      icon: '💊',
      description: language === 'en' ? 'Pharmacy - Medicine Inventory' : 'फार्मेसी - दवा इन्वेंट्री'
    },
    {
      role: 'patient',
      icon: '🙋‍♂️',
      description: language === 'en' ? 'Patient - Health Records' : 'मरीज़ - स्वास्थ्य रिकॉर्ड'
    }
  ];

  return (
    <div className="min-h-screen bg-main-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-neutral-text mb-2">
            {t('appName', language)}
          </h1>
          <p className="text-xl text-muted-foreground">
            {language === 'en' 
              ? 'Select your role to continue' 
              : 'जारी रखने के लिए अपनी भूमिका चुनें'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map(({ role, icon, description }) => (
            <Card 
              key={role}
              className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary"
              onClick={() => onRoleSelect(role)}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">{icon}</div>
                <h3 className="text-xl font-extrabold text-neutral-text">
                  {t(role, language)}
                </h3>
                <p className="text-muted-foreground text-lg">
                  {description}
                </p>
                <Button className="w-full">
                  {language === 'en' ? 'Select Role' : 'भूमिका चुनें'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}