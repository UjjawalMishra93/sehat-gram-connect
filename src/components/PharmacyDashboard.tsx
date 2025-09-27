import { useState } from 'react';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/utils/translations';
import { Medicine, Language } from '@/types';

interface PharmacyDashboardProps {
  language: Language;
  medicines: Medicine[];
  onUpdateStock: (medicineId: string, newStock: number) => void;
}

export default function PharmacyDashboard({ language, medicines, onUpdateStock }: PharmacyDashboardProps) {
  const [stockUpdates, setStockUpdates] = useState<Record<string, string>>({});

  const criticalMedicines = medicines.filter(m => m.stock < 10);
  const lowStockMedicines = medicines.filter(m => m.stock >= 10 && m.stock < 50);
  const inStockMedicines = medicines.filter(m => m.stock >= 50);

  const handleStockUpdate = (medicineId: string) => {
    const newStock = parseInt(stockUpdates[medicineId] || '0');
    if (newStock >= 0) {
      onUpdateStock(medicineId, newStock);
      setStockUpdates(prev => ({ ...prev, [medicineId]: '' }));
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock < 10) return { status: 'critical', color: 'high-urgency' };
    if (stock < 50) return { status: 'low', color: 'medium-urgency' };
    return { status: 'good', color: 'low-urgency' };
  };

  return (
    <div className="p-6 bg-main-background min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold">
              {language === 'en' ? 'Total Medicines' : 'कुल दवाइयां'}
            </CardTitle>
            <Package className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-neutral-text">{medicines.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold text-high-urgency">
              {t('criticalLow', language)}
            </CardTitle>
            <AlertTriangle className="h-6 w-6 text-high-urgency" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-high-urgency">{criticalMedicines.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold text-medium-urgency">
              {language === 'en' ? 'Low Stock' : 'कम स्टॉक'}
            </CardTitle>
            <TrendingUp className="h-6 w-6 text-medium-urgency" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-medium-urgency">{lowStockMedicines.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-extrabold text-low-urgency">
              {t('inStock', language)}
            </CardTitle>
            <Package className="h-6 w-6 text-low-urgency" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-low-urgency">{inStockMedicines.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Inventory */}
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-neutral-text">
          {language === 'en' ? 'Medicine Inventory' : 'दवा इन्वेंट्री'}
        </h2>
        
        <div className="grid gap-4">
          {medicines.map(medicine => {
            const stockStatus = getStockStatus(medicine.stock);
            return (
              <Card key={medicine.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-extrabold text-neutral-text">
                        {language === 'en' ? medicine.name : medicine.nameHi}
                      </h3>
                      <Badge className={`bg-${stockStatus.color}-bg text-${stockStatus.color}`}>
                        {language === 'en' 
                          ? `Stock: ${medicine.stock}`
                          : `स्टॉक: ${medicine.stock}`
                        }
                      </Badge>
                      {medicine.critical && (
                        <Badge variant="outline" className="text-high-urgency border-high-urgency">
                          {language === 'en' ? 'Critical' : 'महत्वपूर्ण'}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-lg">
                      {language === 'en' ? 'Last Updated' : 'अंतिम अपडेट'}: {' '}
                      {new Date(medicine.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`stock-${medicine.id}`} className="text-lg font-medium">
                        {t('updateStock', language)}:
                      </Label>
                      <Input
                        id={`stock-${medicine.id}`}
                        type="number"
                        min="0"
                        value={stockUpdates[medicine.id] || ''}
                        onChange={(e) => setStockUpdates(prev => ({
                          ...prev,
                          [medicine.id]: e.target.value
                        }))}
                        className="w-24 text-lg"
                        placeholder={medicine.stock.toString()}
                      />
                    </div>
                    
                    <Button
                      onClick={() => handleStockUpdate(medicine.id)}
                      disabled={!stockUpdates[medicine.id]}
                    >
                      {t('update', language)}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}