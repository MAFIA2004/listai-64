
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SpellCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  misspelledWord: string;
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  onIgnoreSpelling: () => void;
}

export function SpellCheckDialog({
  open,
  onOpenChange,
  misspelledWord,
  suggestions,
  onSelectSuggestion,
  onIgnoreSpelling
}: SpellCheckDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sugerencia ortográfica</DialogTitle>
          <DialogDescription>
            ¿Quisiste decir alguna de estas opciones para <span className="font-medium">{misspelledWord}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          {suggestions.map((suggestion, idx) => (
            <Button 
              key={idx} 
              variant="outline" 
              onClick={() => onSelectSuggestion(suggestion)} 
              className="w-full justify-start"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onIgnoreSpelling}>
            Usar "{misspelledWord}"
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
