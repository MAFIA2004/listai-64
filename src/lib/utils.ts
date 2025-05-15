import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

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
    'jamón serrano': '🍖',
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
    'coco': '🥥',

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
    'carne': '🥩',
    'pescado': '🐟',
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
