import { Globe, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t } from '@/utils/translations';
import { UserRole, Language, NetworkStatus } from '@/types';

interface HeaderProps {
  userRole: UserRole;
  userName: string;
  language: Language;
  networkStatus: NetworkStatus;
  onLanguageToggle: () => void;
  onNetworkToggle: () => void;
  onSync: () => void;
}

export default function Header({
  userRole,
  userName,
  language,
  networkStatus,
  onLanguageToggle,
  onNetworkToggle,
  onSync
}: HeaderProps) {
  return (
    <header className="bg-card-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-extrabold text-primary">
            {t('appName', language)}
          </h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {t(userRole, language)}
          </Badge>
          <span className="text-lg text-neutral-text font-medium">
            {userName}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Network Status */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNetworkToggle}
              className="flex items-center space-x-2"
            >
              {networkStatus.online ? (
                <>
                  <Wifi className="h-4 w-4 text-low-urgency" />
                  <span className="text-low-urgency">{t('online', language)}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-high-urgency" />
                  <span className="text-high-urgency">{t('offline', language)}</span>
                </>
              )}
            </Button>
            
            {!networkStatus.online && (
              <Button
                variant="default"
                size="sm"
                onClick={onSync}
                className="bg-primary hover:bg-primary/90"
              >
                {t('sync', language)}
              </Button>
            )}
          </div>
          
          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLanguageToggle}
            className="flex items-center space-x-2"
          >
            <Globe className="h-4 w-4" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </Button>
        </div>
      </div>
      
      {/* Last Sync Info */}
      {networkStatus.lastSync && (
        <div className="mt-2 text-sm text-muted-foreground">
          {t('lastSync', language)}: {new Date(networkStatus.lastSync).toLocaleString()}
        </div>
      )}
    </header>
  );
}