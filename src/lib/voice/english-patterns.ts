
// English voice recognition patterns
export const PRICE_PATTERNS = [
  // Price patterns with keywords
  /(\d+([.,]\d{1,2})?)(?:\s*(?:dollars?|euros?|€|\$))/i,
  // "10 dollars", "10€"
  /(\d+)[.,](\d{1,2})(?:\s*(?:dollars?|euros?|€|\$))?/i,
  // "10.50", "10,50" with or without "dollars"
  /(\d+)\s*(?:point|dot)\s*(\d{1,2})(?:\s*(?:dollars?|euros?|€|\$))?/i,
  // "10 point 50" with or without "dollars"
  /at\s*(\d+([.,]\d{1,2})?)(?:\s*(?:dollars?|euros?|€|\$))?/i,
  // "at 10 dollars", "at 10€"
  /for\s*(\d+([.,]\d{1,2})?)(?:\s*(?:dollars?|euros?|€|\$))?/i,
  // "for 10 dollars"
  /costs?\s*(\d+([.,]\d{1,2})?)(?:\s*(?:dollars?|euros?|€|\$))?/i,
  // "costs 10 dollars"
  /price\s*(?:is|:)?\s*(\d+([.,]\d{1,2})?)(?:\s*(?:dollars?|euros?|€|\$))?/i // "price 10 dollars"
];

// Keywords that indicate separation between product and price in English
export const SEPARATOR_KEYWORDS = ['at', 'for', 'costs', 'cost', 'price', 'dollars', 'dollar', 'euros', 'euro', '€', '$'];

// Weight-related keywords in English
export const WEIGHT_KEYWORDS = ['kilo', 'kilos', 'kg', 'grams', 'g', 'half kilo', 'quarter kilo', 'pound', 'pounds', 'lb', 'lbs', 'ounce', 'ounces', 'oz'];

// Patterns for products by weight in English
export const WEIGHT_PATTERNS = [
  /(\d+(?:[.,]\d+)?)\s*(?:kilo|kilos|kg)s?\s+(?:of\s+)?(.+)/i,
  // "2 kilos of apples"
  /(\d+(?:[.,]\d+)?)\s*(?:grams?|g)\s+(?:of\s+)?(.+)/i,
  // "500 grams of cheese"
  /(?:a\s+)?(?:kilo|kg)\s+(?:of\s+)?(.+)/i,
  // "a kilo of potatoes" or "kilo of potatoes"
  /(?:half|half a)\s+(?:kilo|kg)\s+(?:of\s+)?(.+)/i,
  // "half kilo of onions"
  /(?:quarter|quarter of a)\s+(?:kilo|kg)\s+(?:of\s+)?(.+)/i, // "quarter kilo of tomatoes"
  /(\d+(?:[.,]\d+)?)\s*(?:pound|pounds|lb|lbs)\s+(?:of\s+)?(.+)/i,
  // "2 pounds of apples"
  /(\d+(?:[.,]\d+)?)\s*(?:ounce|ounces|oz)\s+(?:of\s+)?(.+)/i // "8 ounces of cheese"
];

// Patterns for quantities in English
export const QUANTITY_PATTERNS = [
  /(\d+)\s+(unit(?:s)?|package(?:s)?|box(?:es)?|bottle(?:s)?|can(?:s)?)\s+(?:of\s+)?(.+)/i,
  // "2 packages of cookies"
  /(\d+)\s+(.+)/i // "3 apples"
];

// Action words to be removed
export const ACTION_WORDS = ['add', 'get', 'buy', 'purchase'];
