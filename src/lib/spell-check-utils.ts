
export function checkSpelling(text: string): { isMisspelled: boolean; suggestions: string[] } {
  // This is a simple implementation that could be replaced with a more sophisticated spell checker
  const commonMisspellings: Record<string, string[]> = {
    'manzana': ['mansana', 'mancana', 'manxana'],
    'plátano': ['platano', 'platáno', 'plátaho'],
    'naranja': ['naranga', 'narangha', 'narahja'],
    'leche': ['lache', 'lache', 'lechee'],
    'pan': ['pann', 'paan', 'pahn'],
    'huevo': ['huebo', 'guevo', 'webo'],
    'queso': ['keso', 'qeso', 'quesso'],
    'agua': ['augua', 'agwa', 'aqua'],
    'tomate': ['tomatte', 'tomat', 'tomaate'],
    'pollo': ['poyo', 'poyito', 'poio'],
    'carne': ['karne', 'carn'],
    'pescado': ['pescao', 'pezcado', 'peskado'],
    'patata': ['patatta', 'potato', 'pataca'],
    'arroz': ['aros', 'aroz', 'arros'],
    'pasta': ['pazta', 'pastta', 'pahta']
  };

  const wordLower = text.toLowerCase().trim();
  let isMisspelled = false;
  let suggestions: string[] = [];

  // Check if the word is a common misspelling
  for (const [correct, misspellings] of Object.entries(commonMisspellings)) {
    if (misspellings.includes(wordLower)) {
      isMisspelled = true;
      suggestions = [correct];
      break;
    }
  }

  // If no common misspelling is found, suggest similar words
  if (!isMisspelled && wordLower.length > 3) {
    const similarWords = Object.keys(commonMisspellings).filter(word => {
      // Simple distance-based similarity (very basic implementation)
      if (Math.abs(word.length - wordLower.length) > 2) return false;
      
      let commonChars = 0;
      for (let char of wordLower) {
        if (word.includes(char)) commonChars++;
      }
      
      return commonChars / word.length > 0.6;
    });
    
    if (similarWords.length > 0) {
      isMisspelled = true;
      suggestions = similarWords.slice(0, 3);  // Limit to 3 suggestions
    }
  }

  return { isMisspelled, suggestions };
}
