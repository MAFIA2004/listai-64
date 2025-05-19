
import { SuggestionItem } from './SuggestionItem';
import { useLanguage } from '@/hooks/use-language';

interface RecipeSuggestion {
  name: string;
  quantity: number;
  selected: boolean;
}

interface SuggestionsListProps {
  suggestions: RecipeSuggestion[];
  onToggleSelection: (index: number) => void;
  onOpenAddForm: (item: RecipeSuggestion) => void;
}

export function SuggestionsList({ suggestions, onToggleSelection, onOpenAddForm }: SuggestionsListProps) {
  const { language } = useLanguage();
  
  if (!suggestions.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {language === 'es' ? 'No hay sugerencias disponibles' : 'No suggestions available'}
      </div>
    );
  }
  
  return (
    <div className="max-h-[240px] overflow-y-auto space-y-2 mb-4 pr-1">
      {suggestions.map((item, index) => (
        <SuggestionItem 
          key={index}
          item={item}
          index={index}
          onToggleSelection={onToggleSelection}
          onOpenAddForm={onOpenAddForm}
        />
      ))}
    </div>
  );
}
