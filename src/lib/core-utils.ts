/**
 * Utility function to classify a string as a token, checking if it matches common token patterns
 * @param str String to check
 * @returns Boolean indicating if the string is likely a token
 */
export const isTokenString = (str: string): boolean => {
  // Simple pattern matching for common token formats
  const tokenPatterns = [
    /^[A-Za-z0-9-_]{24}$/,        // Matches 24 character alphanumeric strings with hyphens/underscores
    /^[A-Za-z0-9]{32}$/,          // Matches 32 character alphanumeric strings
    /^sk-[A-Za-z0-9]{32,}$/,      // Matches strings starting with sk- followed by 32+ alphanumeric chars
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUID format
    /^bearer\s+[A-Za-z0-9._~+/-]+=*$/i, // Bearer tokens
    /^[A-Za-z0-9-_]{8}\.[A-Za-z0-9-_]{8}\.[A-Za-z0-9-_]{8,}$/  // JWT-like tokens
  ];
  
  return tokenPatterns.some(pattern => pattern.test(str));
};

/**
 * Utility function to join class names
 * @param classes Array or object of class names
 * @returns String of joined class names
 */
export function cn(...classes: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return classes
    .filter(Boolean)
    .map(c => {
      if (typeof c === 'object') {
        return Object.entries(c)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return c;
    })
    .join(' ');
}

/**
 * Format a number as a price with the € symbol
 * @param price Number to format
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  // Show the exact value without removing trailing zeros
  // This ensures 0.2 is displayed as 0.2€ and not 0.20€
  if (price === 0) return '0€';
  
  // Convert to string with 2 decimal places
  const formattedPrice = price.toFixed(2);
  
  // Remove trailing zeros
  let cleanedPrice = formattedPrice;
  
  // If it ends with .00, remove the decimals completely
  if (cleanedPrice.endsWith('.00')) {
    cleanedPrice = cleanedPrice.replace('.00', '');
  } 
  // Otherwise just remove trailing zeros but keep at least one decimal if there's a decimal point
  else {
    cleanedPrice = cleanedPrice.replace(/0+$/, '');
    if (cleanedPrice.endsWith('.')) {
      cleanedPrice = cleanedPrice.replace('.', '');
    }
  }
  
  return `${cleanedPrice}€`;
};
