
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PurchaseHistoryEntry } from '@/hooks/use-shopping-list';
import { formatPrice } from '@/lib/utils';
import { Calendar, History, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseHistory: PurchaseHistoryEntry[];
}

export function HistoryDialog({ open, onOpenChange, purchaseHistory }: HistoryDialogProps) {
  const [selectedEntry, setSelectedEntry] = useState<PurchaseHistoryEntry | null>(null);

  const handleSelectEntry = (entry: PurchaseHistoryEntry) => {
    setSelectedEntry(entry);
  };

  const handleBack = () => {
    setSelectedEntry(null);
  };

  // Group entries by date (same day)
  const groupedEntries = purchaseHistory.reduce<Record<string, PurchaseHistoryEntry[]>>((acc, entry) => {
    const dateKey = format(entry.date, 'yyyy-MM-dd');
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    acc[dateKey].push(entry);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setSelectedEntry(null);
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedEntry ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 mr-2" 
                  onClick={handleBack}
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                Compra del {format(selectedEntry.date, 'PPP', { locale: es })}
              </>
            ) : (
              <>
                <History className="h-5 w-5" />
                Historial de Compras
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {selectedEntry ? (
          <div className="py-4">
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">{format(selectedEntry.date, 'PPP HH:mm', { locale: es })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">{formatPrice(selectedEntry.totalAmount)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Artículos comprados:</h3>
              <ScrollArea className="h-[220px] pr-4">
                <div className="space-y-2">
                  {selectedEntry.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity > 1 && `${item.quantity}x `}{formatPrice(item.price)}
                        </p>
                      </div>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            {Object.keys(groupedEntries).length > 0 ? (
              <div className="space-y-4 py-4">
                {Object.entries(groupedEntries)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([dateKey, entries]) => (
                    <div key={dateKey} className="space-y-2">
                      <h3 className="font-medium flex items-center gap-2 text-primary">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(dateKey), 'PPPP', { locale: es })}
                      </h3>
                      
                      {entries.sort((a, b) => b.date.getTime() - a.date.getTime()).map(entry => (
                        <div 
                          key={entry.id}
                          onClick={() => handleSelectEntry(entry)}
                          className="flex justify-between items-center p-3 border rounded-md hover:bg-accent cursor-pointer"
                        >
                          <div>
                            <p className="font-medium">{format(entry.date, 'HH:mm', { locale: es })}</p>
                            <p className="text-xs text-muted-foreground">{entry.items.length} artículos</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatPrice(entry.totalAmount)}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <History className="mx-auto mb-3 opacity-30" size={40} />
                <p>No hay historial de compras</p>
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
