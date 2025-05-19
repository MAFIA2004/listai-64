
import { Button } from '@/components/ui/button';
import { PurchaseHistoryEntry } from '@/types/shopping';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HistoryDateGroup } from './HistoryDateGroup';
import { EmptyHistoryState } from './EmptyHistoryState';

interface HistoryListProps {
  groupedEntries: Record<string, PurchaseHistoryEntry[]>;
  onSelectEntry: (entry: PurchaseHistoryEntry) => void;
  onOpenDeleteAllDialog: () => void;
}

export function HistoryList({ 
  groupedEntries, 
  onSelectEntry,
  onOpenDeleteAllDialog
}: HistoryListProps) {
  const entriesExist = Object.keys(groupedEntries).length > 0;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Listas guardadas</h3>
        {entriesExist && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
            onClick={onOpenDeleteAllDialog}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Borrar historial
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[330px] pr-4">
        {entriesExist ? (
          <div className="space-y-4">
            {Object.entries(groupedEntries)
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([dateKey, entries]) => (
                <HistoryDateGroup 
                  key={dateKey}
                  dateKey={dateKey}
                  entries={entries}
                  onSelectEntry={onSelectEntry}
                />
              ))
            }
          </div>
        ) : (
          <EmptyHistoryState />
        )}
      </ScrollArea>
    </div>
  );
}
