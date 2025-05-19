
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PurchaseHistoryEntry } from '@/types/shopping';
import { format } from 'date-fns';

// Componentes refactorizados
import { HistoryDialogHeader } from './history/HistoryDialogHeader';
import { HistoryList } from './history/HistoryList';
import { HistoryEntryDetail } from './history/HistoryEntryDetail';
import { DeleteConfirmDialog } from './history/DeleteConfirmDialog';

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
          <HistoryDialogHeader
            selectedEntry={selectedEntry}
            onBack={handleBack}
          />

          {selectedEntry ? (
            <HistoryEntryDetail
              selectedEntry={selectedEntry}
              onBack={handleBack}
              onRestore={handleRestore}
              onDelete={() => setIsDeleteDialogOpen(true)}
            />
          ) : (
            <HistoryList
              groupedEntries={groupedEntries}
              onSelectEntry={handleSelectEntry}
              onOpenDeleteAllDialog={() => setIsDeleteAllDialogOpen(true)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="¿Eliminar esta lista?"
        description="Esta acción eliminará esta lista del historial permanentemente."
      />
      
      <DeleteConfirmDialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
        onConfirm={handleDeleteAllHistory}
        title="¿Eliminar todo el historial?"
        description="Esta acción eliminará todas las listas del historial permanentemente."
      />
    </>
  );
}
