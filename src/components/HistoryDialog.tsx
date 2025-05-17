
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PurchaseHistoryEntry } from '@/hooks/use-shopping-list';
import { formatPrice } from '@/lib/utils';
import { Calendar, History, ChevronRight, RefreshCw, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseHistory: PurchaseHistoryEntry[];
  onRestoreList?: (historyEntryId: string) => void;
  onDeleteList?: (historyEntryId: string) => void;
  onDeleteAllHistory?: () => void;
}

export function HistoryDialog({ 
  open, 
  onOpenChange, 
  purchaseHistory,
  onRestoreList,
  onDeleteList,
  onDeleteAllHistory
}: HistoryDialogProps) {
  const [selectedEntry, setSelectedEntry] = useState<PurchaseHistoryEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleSelectEntry = (entry: PurchaseHistoryEntry) => {
    setSelectedEntry(entry);
  };

  const handleBack = () => {
    setSelectedEntry(null);
  };

  const handleRestore = () => {
    if (selectedEntry && onRestoreList) {
      onRestoreList(selectedEntry.id);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (selectedEntry && onDeleteList) {
      onDeleteList(selectedEntry.id);
      setSelectedEntry(null);
    }
    setIsDeleteDialogOpen(false);
  };
  
  const handleDeleteAllHistory = () => {
    if (onDeleteAllHistory) {
      onDeleteAllHistory();
      setIsDeleteAllDialogOpen(false);
    }
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
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) setSelectedEntry(null);
        onOpenChange(isOpen);
      }}>
        <DialogContent className="sm:max-w-md ai-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntry ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="back-button h-8 w-8 p-0 mr-2" 
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="gradient-text">Compra del {format(selectedEntry.date, 'PPP', { locale: es })}</span>
                </>
              ) : (
                <>
                  <History className="h-5 w-5 text-primary" />
                  <span className="gradient-text">Histori</span>
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
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
                
                {onRestoreList && (
                  <Button onClick={handleRestore}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restaurar lista
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Listas guardadas</h3>
                {purchaseHistory.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                    onClick={() => setIsDeleteAllDialogOpen(true)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Borrar historial
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[330px] pr-4">
                {Object.keys(groupedEntries).length > 0 ? (
                  <div className="space-y-4">
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
                              className="history-card flex justify-between items-center cursor-pointer"
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-effect">
          <AlertDialogHeader>
            <AlertDialogTitle className="gradient-text">¿Eliminar esta lista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará esta lista del historial permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent className="glass-effect">
          <AlertDialogHeader>
            <AlertDialogTitle className="gradient-text">¿Eliminar todo el historial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todas las listas del historial permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Borrar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
