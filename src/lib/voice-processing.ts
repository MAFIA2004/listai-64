
import { identifyQuantities } from '@/lib/gemini-service';
import { toast } from "sonner";

// Constantes para patrones de reconocimiento
const PRICE_PATTERNS = [
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
const SEPARATOR_KEYWORDS = ['a', 'por', 'vale', 'cuesta', 'precio', 'de', 'euros', 'euro', '€'];

// Palabras relacionadas con peso/kilo
const WEIGHT_KEYWORDS = ['kilo', 'kilos', 'kg', 'gramos', 'g', 'medio kilo', 'cuarto de kilo'];

// Patrones para productos por peso
const WEIGHT_PATTERNS = [
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
const QUANTITY_PATTERNS = [
  /(\d+)\s+(unidad(?:es)?|paquete(?:s)?|caja(?:s)?|botella(?:s)?|lata(?:s)?)\s+de\s+(.+)/i,
  // "2 paquetes de galletas"
  /(\d+)\s+(.+)/i // "3 manzanas"
];

// Función para procesar la entrada de voz usando Gemini AI
export const processVoiceInputWithAI = async (transcript: string): Promise<{ 
  name?: string; 
  price?: string; 
  quantity?: string;
}> => {
  try {
    // Usar Gemini para analizar la entrada de voz
    const result = await identifyQuantities(transcript);
    if (result && result.items && result.items.length > 0) {
      const item = result.items[0];
      const response: { name?: string; price?: string; quantity?: string } = {};
      
      if (item.name) {
        response.name = item.name;
      }
      
      if (item.quantity && item.quantity > 0) {
        response.quantity = item.quantity.toString();
      }
      
      if (item.price) {
        response.price = item.price.toString();
      }

      // Mostrar toast con lo que se entendió
      const quantityText = item.quantity && item.quantity > 1 ? ` (${item.quantity}x)` : '';
      const priceText = item.price ? ` por ${item.price}€` : '';
      toast.success("Entrada por voz reconocida", {
        description: `"${item.name}"${quantityText}${priceText}`
      });
      
      return response;
    }
    
    // Si Gemini falla, usar el procesamiento clásico
    return processVoiceInputClassic(transcript);
  } catch (error) {
    console.error("Error procesando entrada de voz con AI:", error);
    // Fallback al procesamiento clásico
    return processVoiceInputClassic(transcript);
  }
};

// Función clásica para procesar la entrada de voz
export const processVoiceInputClassic = (transcript: string): { name?: string; price?: string; quantity?: string } => {
  let name = '';
  let price = '';
  let quantity = '1';

  // Normalizar el texto
  const normalizedTranscript = transcript.toLowerCase().trim();

  // 1. Verificar productos por peso
  for (const pattern of WEIGHT_PATTERNS) {
    const match = normalizedTranscript.match(pattern);
    if (match) {
      if (match[1] && match[2]) {
        // Si tiene cantidad y nombre
        name = `${match[2]} (${match[1]} kg)`.trim();
      } else if (match[1]) {
        // Si solo tiene cantidad
        name = `(${match[1]} kg)`.trim();
      } else if (match[0]) {
        // Si solo tiene nombre
        name = `${match[1]} (1 kg)`.trim();
      }

      // Buscar precio después de la parte de peso
      const remainingText = normalizedTranscript.replace(match[0], '').trim();

      // Buscar precio en el texto restante
      for (const pricePattern of PRICE_PATTERNS) {
        const priceMatch = remainingText.match(pricePattern);
        if (priceMatch && priceMatch[1]) {
          price = priceMatch[1].replace(',', '.');
          break;
        }
      }

      return { name, price, quantity: "1" }; // El peso ya está incluido en el nombre
    }
  }

  // 2. Verificar cantidades específicas
  for (const pattern of QUANTITY_PATTERNS) {
    const match = normalizedTranscript.match(pattern);
    if (match && match[1] && (match[2] || match[3])) {
      quantity = match[1];

      // Obtener el nombre del producto
      if (match[3]) {
        name = match[3].trim(); // Para el patrón con unidad específica
      } else {
        name = match[2].trim(); // Para el patrón genérico
      }

      // Buscar precio en el texto restante
      const remainingText = normalizedTranscript.replace(match[0], '').trim();
      for (const pricePattern of PRICE_PATTERNS) {
        const priceMatch = remainingText.match(pricePattern);
        if (priceMatch && priceMatch[1]) {
          price = priceMatch[1].replace(',', '.');
          break;
        }
      }
      
      return { name, price, quantity };
    }
  }

  // 3. Buscar el precio utilizando patrones comunes
  let foundPrice = false;
  let priceValue = '';
  for (const pattern of PRICE_PATTERNS) {
    const match = normalizedTranscript.match(pattern);
    if (match && match[1]) {
      priceValue = match[1].replace(',', '.');
      foundPrice = true;

      // Extraer el nombre eliminando la parte del precio
      name = normalizedTranscript.replace(match[0], '').trim();
      break;
    }
  }
  
  if (foundPrice) {
    price = priceValue;
  } else {
    // 3. Si no hay patrón directo, intentar dividir por palabras clave
    const words = normalizedTranscript.split(' ');
    let beforeSeparator: string[] = [];
    let afterSeparator: string[] = [];
    let foundSeparator = false;
    
    for (let i = 0; i < words.length; i++) {
      if (!foundSeparator && SEPARATOR_KEYWORDS.some(keyword => words[i].includes(keyword))) {
        foundSeparator = true;
        // Buscar un número después del separador
        for (let j = i; j < words.length; j++) {
          if (/\d+([.,]\d{1,2})?/.test(words[j])) {
            price = words[j].replace(',', '.');
            break;
          }
        }
      } else if (foundSeparator) {
        afterSeparator.push(words[i]);
      } else {
        beforeSeparator.push(words[i]);
      }
    }

    // Si no se encontró separador, usar todo como nombre
    if (beforeSeparator.length > 0 && !foundSeparator) {
      name = beforeSeparator.join(' ');
    } else {
      name = beforeSeparator.join(' ');
    }
  }

  // 4. Limpiar el nombre final quitando palabras clave redundantes
  for (const keyword of [...SEPARATOR_KEYWORDS, ...WEIGHT_KEYWORDS]) {
    name = name.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '');
  }

  // Eliminar palabras de precio comunes y artículos
  const wordsToRemove = ['añadir', 'añade', 'agregar', 'agrega', 'add', 'pon', 'poner'];
  for (const word of wordsToRemove) {
    const regex = new RegExp(`^${word}\\s+`, 'i');
    name = name.replace(regex, '');
  }

  // Limpiar espacios múltiples
  name = name.replace(/\s+/g, ' ').trim();

  // Mostrar toast con lo que se entendió
  if (name && price) {
    toast.success("Entrada por voz reconocida", {
      description: `"${name}" por ${price}€${quantity !== '1' ? ` (${quantity}x)` : ''}`
    });
  } else if (name) {
    toast.info("Producto reconocido, falta precio", {
      description: `"${name}"${quantity !== '1' ? ` (${quantity}x)` : ''}`
    });
  } else if (price) {
    toast.info("Precio reconocido, falta producto", {
      description: `${price}€`
    });
  } else {
    toast.warning("No se reconoció correctamente", {
      description: "Intenta de nuevo con 'producto a precio'"
    });
  }

  return { name, price, quantity };
};
