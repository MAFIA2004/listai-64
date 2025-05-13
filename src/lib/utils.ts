
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COMMON_MISSPELLINGS_MAP, EMOJI_MAP, KNOWN_WORDS_FOR_SPELLCHECK } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get emoji for a given item name
export function getItemEmoji(itemName: string): string {
  const lowercaseName = itemName.toLowerCase();
  
  // Check direct match
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lowercaseName.includes(key)) {
      return emoji;
    }
  }
  
  return EMOJI_MAP.default;
}

// Check if word is misspelled and get suggestions
export function checkSpelling(word: string): { 
  isMisspelled: boolean; 
  suggestions: string[];
  corrected?: string; 
} {
  const lowercaseWord = word.toLowerCase();
  
  // Check if word is in our known words list
  if (KNOWN_WORDS_FOR_SPELLCHECK.includes(lowercaseWord)) {
    return { isMisspelled: false, suggestions: [] };
  }
  
  // Check if word is in our common misspellings map
  if (COMMON_MISSPELLINGS_MAP[lowercaseWord]) {
    return { 
      isMisspelled: true, 
      suggestions: [COMMON_MISSPELLINGS_MAP[lowercaseWord]],
      corrected: COMMON_MISSPELLINGS_MAP[lowercaseWord]
    };
  }
  
  // Generate suggestions for misspelled words using Levenshtein distance
  const suggestions = KNOWN_WORDS_FOR_SPELLCHECK
    .filter(knownWord => levenshteinDistance(lowercaseWord, knownWord) <= 2)
    .sort((a, b) => levenshteinDistance(lowercaseWord, a) - levenshteinDistance(lowercaseWord, b))
    .slice(0, 3);
  
  return {
    isMisspelled: suggestions.length > 0,
    suggestions
  };
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Format price with Euro symbol
export function formatPrice(price: number): string {
  return `${price.toFixed(2).replace('.', ',')} €`;
}
