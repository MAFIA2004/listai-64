
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import { getItemEmoji } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

interface RecipeSuggestion {
  name: string;
  quantity: number;
  selected: boolean;
}

interface SuggestionItemProps {
  item: RecipeSuggestion;
  index: number;
  onToggleSelection: (index: number) => void;
  onOpenAddForm: (item: RecipeSuggestion) => void;
}

export function SuggestionItem({ item, index, onToggleSelection, onOpenAddForm }: SuggestionItemProps) {
  const { language } = useLanguage();
  
  return (
    <div className="flex items-center justify-between p-2 border border-border/40 rounded-md bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 flex-1">
        <Button
          variant={item.selected ? "default" : "outline"}
          size="icon"
          className={`h-6 w-6 shrink-0 ${item.selected ? "bg-primary text-primary-foreground" : "border-primary/30"}`}
          onClick={() => onToggleSelection(index)}
        >
          <Check className="h-3 w-3" />
        </Button>
        <span className={item.selected ? "font-medium" : "text-muted-foreground"}>
          {getItemEmoji(item.name)} {item.name}
        </span>
      </div>
      
      {item.selected && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenAddForm(item)}
          className="text-xs border-primary/30 bg-card/30"
        >
          <Plus className="h-3 w-3 mr-1" />
          {language === 'es' ? 'Añadir' : 'Add'}
        </Button>
      )}
    </div>
  );
}
