import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { t } from '@/utils/translations';
import { Medicine, Language } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PharmacyDashboardAuthProps {
  language: Language;
}

export default function PharmacyDashboardAuth({ language }: PharmacyDashboardAuthProps) {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadMedicines();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('medicines-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medicines'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setMedicines(prev => prev.map(m => 
              m.id === payload.new.id ? payload.new as Medicine : m
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) setMedicines(data);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (medicineId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update({ 
          stock: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('id', medicineId);

      if (error) throw error;

      setMedicines(prev => prev.map(m => 
        m.id === medicineId 
          ? { ...m, stock: newStock, last_updated: new Date().toISOString() }
          : m
      ));

      setEditingStock(prev => {
        const newState = { ...prev };
        delete newState[medicineId];
        return newState;
      });

      toast({
        title: language === 'en' ? "Stock Updated" : "स्टॉक अपडेट हुआ",
        description: language === 'en' 
          ? "Medicine stock updated successfully" 
          : "दवा का स्टॉक सफलतापूर्वक अपडेट हुआ"
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  const criticalMedicines = medicines.filter(m => m.critical && m.stock < 20);
  const lowStockMedicines = medicines.filter(m => m.stock < 10);

  if (loading) {
    return (
      <div className="p-6 bg-main-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-main-background min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-neutral-text">
          {t('pharmacy', language)} Dashboard
        </h2>
        
        <div className="flex items-center gap-4">
          {criticalMedicines.length > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {criticalMedicines.length} Critical Low
            </Badge>
          )}
          {lowStockMedicines.length > 0 && (
            <Badge variant="default" className="text-lg px-3 py-1">
              {lowStockMedicines.length} Low Stock
            </Badge>
          )}
        </div>
      </div>

      {criticalMedicines.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-xl font-extrabold text-red-600 mb-4 flex items-center gap-2">
            🚨 {language === 'en' ? 'Critical Stock Alerts' : 'गंभीर स्टॉक अलर्ट'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalMedicines.map((medicine) => (
              <div key={medicine.id} className="p-4 bg-white border border-red-200 rounded-lg">
                <p className="font-bold text-neutral-text mb-1">
                  {language === 'en' ? medicine.name : medicine.name_hi}
                </p>
                <p className="text-sm text-red-600 font-medium mb-2">
                  Only {medicine.stock} units left!
                </p>
                <Badge variant="destructive">Urgent Restock</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-extrabold text-neutral-text mb-4">
          📦 {language === 'en' ? 'Medicine Inventory' : 'दवा इन्वेंट्री'}
        </h3>
        
        <div className="space-y-4">
          {medicines.map((medicine) => (
            <div key={medicine.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="font-bold text-neutral-text">
                  {language === 'en' ? medicine.name : medicine.name_hi}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? medicine.name_hi : medicine.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(medicine.last_updated).toLocaleString()}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {editingStock[medicine.id] !== undefined ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editingStock[medicine.id]}
                        onChange={(e) => setEditingStock(prev => ({
                          ...prev,
                          [medicine.id]: e.target.value
                        }))}
                        className="w-20"
                        min="0"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStock(medicine.id, parseInt(editingStock[medicine.id]))}
                        disabled={!editingStock[medicine.id] || parseInt(editingStock[medicine.id]) < 0}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingStock(prev => {
                          const newState = { ...prev };
                          delete newState[medicine.id];
                          return newState;
                        })}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-neutral-text min-w-[60px] text-right">
                        {medicine.stock}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingStock(prev => ({
                          ...prev,
                          [medicine.id]: medicine.stock.toString()
                        }))}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {medicine.critical && medicine.stock < 20 && (
                    <Badge variant="destructive" className="text-xs">
                      {medicine.stock < 5 ? 'Critical' : 'Low'}
                    </Badge>
                  )}
                  {medicine.critical && (
                    <Badge variant="secondary" className="text-xs">
                      Essential
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-extrabold text-neutral-text mb-4">
          📊 {language === 'en' ? 'Inventory Summary' : 'इन्वेंट्री सारांश'}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-neutral-text">{medicines.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Total Medicines' : 'कुल दवाएं'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{criticalMedicines.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Critical Low' : 'गंभीर कम'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{lowStockMedicines.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Low Stock' : 'कम स्टॉक'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {medicines.filter(m => m.stock >= 20).length}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Well Stocked' : 'पर्याप्त स्टॉक'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}