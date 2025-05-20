
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  // Si el precio es menor que 1 pero mayor que 0, convertirlo a céntimos
  const displayPrice = price >= 0 && price < 1 ? price / 10 : price;
  
  // Asegurar que siempre se muestren 2 decimales para todos los precios
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(displayPrice);
};

// Adding the missing checkSpelling function
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

export function getItemEmoji(itemName: string): string {
  const name = itemName.toLowerCase().trim();

  // Match list expanded with more products
  const emojiMap: Record<string, string> = {
    // Fruits
    'manzana': '🍎',
    'plátano': '🍌',
    'banana': '🍌',
    'naranja': '🍊',
    'limón': '🍋',
    'lima': '🍈',
    'pera': '🍐',
    'melocotón': '🍑',
    'durazno': '🍑',
    'cereza': '🍒',
    'fresa': '🍓',
    'frambuesa': '🍓',
    'mora': '🍓',
    'uva': '🍇',
    'uvas': '🍇',
    'sandía': '🍉',
    'melón': '🍈',
    'piña': '🍍',
    'coco': '🥥',
    'aguacate': '🥑',
    'kiwi': '🥝',
    'mango': '🥭',

    // Vegetables
    'tomate': '🍅',
    'patata': '🥔',
    'papa': '🥔',
    'zanahoria': '🥕',
    'maíz': '🌽',
    'choclo': '🌽',
    'pimiento': '🫑',
    'ají': '🫑',
    'berenjena': '🍆',
    'pepino': '🥒',
    'brócoli': '🥦',
    'coliflor': '🥦',
    'lechuga': '🥬',
    'espinaca': '🥬',
    'espárragos': '🥦',
    'ajo': '🧄',
    'cebolla': '🧅',
    'champiñón': '🍄',
    'seta': '🍄',
    'hongos': '🍄',

    // Bread & baked goods
    'pan': '🍞',
    'baguette': '🥖',
    'croissant': '🥐',
    'pretzel': '🥨',
    'bagel': '🥯',
    'panqueque': '🥞',
    'waffle': '🧇',
    'galleta': '🍪',
    'torta': '🍰',
    'pastel': '🍰',
    'tarta': '🥧',
    'pie': '🥧',
    'donut': '🍩',
    'rosquilla': '🍩',
    'muffin': '🧁',
    'magdalena': '🧁',

    // Dairy & eggs
    'leche': '🥛',
    'queso': '🧀',
    'huevo': '🥚',
    'huevos': '🥚',
    'mantequilla': '🧈',
    'yogur': '🥛',
    'yogurt': '🥛',

    // Meat
    'carne': '🥩',
    'filete': '🥩',
    'bistec': '🥩',
    'pollo': '🍗',
    'pavo': '🦃',
    'salchicha': '🌭',
    'hot dog': '🌭',
    'hamburguesa': '🍔',
    'tocino': '🥓',
    'bacon': '🥓',
    'jamón': '🍖',
    'chorizo': '🌭',
    'salami': '🥩',

    // Seafood
    'pescado': '🐟',
    'atún': '🐟',
    'salmón': '🍣',
    'sardina': '🐟',
    'camarón': '🦐',
    'gamba': '🦐',
    'langosta': '🦞',
    'cangrejo': '🦀',
    'pulpo': '🐙',
    'calamar': '🦑',
    'mariscos': '🦞',

    // Fast food & prepared
    'pizza': '🍕',
    'taco': '🌮',
    'burrito': '🌯',
    'sandwich': '🥪',
    'sándwich': '🥪',
    'sushi': '🍣',
    'ramen': '🍜',
    'pasta': '🍝',
    'espagueti': '🍝',
    'fideos': '🍜',
    
    // Sweets & desserts
    'chocolate': '🍫',
    'caramelo': '🍬',
    'dulce': '🍭',
    'helado': '🍦',
    'nieve': '🍦',
    'paleta': '🍦',

    // Drinks
    'agua': '💧',
    'café': '☕',
    'té': '🍵',
    'jugo': '🧃',
    'zumo': '🧃',
    'refresco': '🥤',
    'gaseosa': '🥤',
    'soda': '🥤',
    'cerveza': '🍺',
    'vino': '🍷',
    'champán': '🍾',
    'champagne': '🍾',
    'cóctel': '🍸',
    'coctel': '🍸',

    // Condiments & spices
    'sal': '🧂',
    'pimienta': '🌶️',
    'chile': '🌶️',
    'aceite': '🫒',
    'vinagre': '🧴',
    'miel': '🍯',
    'azúcar': '🧁',

    // Nuts & grains
    'nuez': '🌰',
    'nueces': '🌰',
    'maní': '🥜',
    'cacahuete': '🥜',
    'almendra': '🥜',
    'arroz': '🍚',
    'avena': '🥣',
    'cereal': '🥣',
    'trigo': '🌾',
    'cebada': '🌾',

    // Household & cleaning
    'papel higiénico': '🧻',
    'detergente': '🧴',
    'jabón': '🧼',
    'champú': '🧴',
    'shampoo': '🧴',
    'toallas': '🧻',
    'servilletas': '🧻',

    // Default categories
    'fruta': '🍎',
    'frutas': '🍎',
    'verdura': '🥕',
    'verduras': '🥕',
    'lácteos': '🥛',
    'panadería': '🍞',
    'bebida': '🥤',
    'bebidas': '🥤',
    'snack': '🍿',
    'aperitivo': '🍿',
    'postre': '🍰',
    'limpieza': '🧹',
  };

  // Try to find exact matches or partial matches in the words
  let emoji = '';
  
  // First try direct match
  if (emojiMap[name]) {
    return emojiMap[name];
  }
  
  // Then try matching individual words
  const words = name.split(' ');
  for (const word of words) {
    if (word.length > 2 && emojiMap[word]) {
      return emojiMap[word];
    }
  }
  
  // Try partial match for any word longer than 3 characters
  for (const key in emojiMap) {
    for (const word of words) {
      if (word.length > 3 && (key.includes(word) || word.includes(key))) {
        return emojiMap[key];
      }
    }
  }
  
  // Default emoji if no match found
  return '🛒';
}
