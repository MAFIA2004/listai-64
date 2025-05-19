
import { ArrowLeft, History } from 'lucide-react';
import { PurchaseHistoryEntry } from '@/types/shopping';
import { DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/hooks/use-language';

interface HistoryDialogHeaderProps {
  selectedEntry: PurchaseHistoryEntry | null;
  onBack: () => void;
}

export function HistoryDialogHeader({ selectedEntry, onBack }: HistoryDialogHeaderProps) {
  const { language, t } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        {selectedEntry ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="back-button h-8 w-8 p-0 mr-2" 
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="gradient-text">
              {t('history.purchase_of').replace('{date}', format(selectedEntry.date, 'PPP', { locale }))}
            </span>
          </>
        ) : (
          <>
            <History className="h-5 w-5 text-primary" />
            <span className="gradient-text">{t('dialog.history_title')}</span>
          </>
        )}
      </DialogTitle>
    </DialogHeader>
  );
}
