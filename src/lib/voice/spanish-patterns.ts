
// Spanish voice recognition patterns
export const PRICE_PATTERNS = [
  // Patrones de precio con palabras clave
  /(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))/i,
  // "10 euros", "10€"
  /(\d+)[.,](\d{1,2})(?:\s*(?:euros?|€))?/i,
  // "10.50", "10,50" con o sin "euros"
  /(\d+)\s*con\s*(\d{1,2})(?:\s*(?:euros?|€))?/i,
  // "10 con 50" con o sin "euros"
  /a\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,
  // "a 10 euros", "a 10€"
  /por\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,
  // "por 10 euros"
  /vale\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,
  // "vale 10 euros"
  /cuesta\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i,
  // "cuesta 10 euros"
  /precio\s*(?:de|es|:)?\s*(\d+([.,]\d{1,2})?)(?:\s*(?:euros?|€))?/i // "precio 10 euros"
];

// Palabras clave que indican la separación entre producto y precio
export const SEPARATOR_KEYWORDS = ['a', 'por', 'vale', 'cuesta', 'precio', 'de', 'euros', 'euro', '€'];

// Palabras relacionadas con peso/kilo
export const WEIGHT_KEYWORDS = ['kilo', 'kilos', 'kg', 'gramos', 'g', 'medio kilo', 'cuarto de kilo'];

// Patrones para productos por peso
export const WEIGHT_PATTERNS = [
  /(\d+(?:[.,]\d+)?)\s*(?:kilo|kilos|kg)s?\s+de\s+(.+)/i,
  // "2 kilos de manzanas"
  /(\d+(?:[.,]\d+)?)\s*(?:gramos?|g)\s+de\s+(.+)/i,
  // "500 gramos de queso"
  /(?:un\s+)?(?:kilo|kg)\s+de\s+(.+)/i,
  // "un kilo de patatas" o "kilo de patatas"
  /(?:medio|mitad de un)\s+(?:kilo|kg)\s+de\s+(.+)/i,
  // "medio kilo de cebollas"
  /(?:cuarto de)\s+(?:kilo|kg)\s+de\s+(.+)/i // "cuarto de kilo de tomates"
];

// Patrones para cantidades
export const QUANTITY_PATTERNS = [
  /(\d+)\s+(unidad(?:es)?|paquete(?:s)?|caja(?:s)?|botella(?:s)?|lata(?:s)?)\s+de\s+(.+)/i,
  // "2 paquetes de galletas"
  /(\d+)\s+(.+)/i // "3 manzanas"
];

// Palabras de acción que se eliminan
export const ACTION_WORDS = ['añadir', 'añade', 'agregar', 'agrega', 'add', 'pon', 'poner'];
