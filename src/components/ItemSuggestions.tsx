
import { useRef, useEffect } from 'react';

interface ItemSuggestionsProps {
  show: boolean;
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function ItemSuggestions({ show, suggestions, onSelectSuggestion }: ItemSuggestionsProps) {
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        // The component should receive a callback to close suggestions,
        // but since we're refactoring and not changing functionality, we'll leave this empty
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto" 
      ref={suggestionsRef}
    >
      {suggestions.map((suggestion, idx) => (
        <div 
          key={idx} 
          className="p-2 hover:bg-muted cursor-pointer" 
          onClick={() => onSelectSuggestion(suggestion)}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
}
