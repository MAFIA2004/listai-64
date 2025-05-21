
import { toast } from "sonner";
import { 
  PRICE_PATTERNS as ES_PRICE_PATTERNS,
  WEIGHT_PATTERNS as ES_WEIGHT_PATTERNS,
  QUANTITY_PATTERNS as ES_QUANTITY_PATTERNS,
  SEPARATOR_KEYWORDS as ES_SEPARATOR_KEYWORDS,
  WEIGHT_KEYWORDS as ES_WEIGHT_KEYWORDS,
  ACTION_WORDS as ES_ACTION_WORDS
} from './spanish-patterns';

import { 
  PRICE_PATTERNS as EN_PRICE_PATTERNS,
  WEIGHT_PATTERNS as EN_WEIGHT_PATTERNS,
  QUANTITY_PATTERNS as EN_QUANTITY_PATTERNS,
  SEPARATOR_KEYWORDS as EN_SEPARATOR_KEYWORDS,
  WEIGHT_KEYWORDS as EN_WEIGHT_KEYWORDS,
  ACTION_WORDS as EN_ACTION_WORDS
} from './english-patterns';

/**
 * Classic processor for voice input
 */
export const processVoiceInputClassic = (transcript: string, currentLanguage: string): { 
  name?: string; 
  price?: string; 
  quantity?: string; 
} => {
  let name = '';
  let price = '';
  let quantity = '1';

  // Normalize the text
  const normalizedTranscript = transcript.toLowerCase().trim();
  
  // Select the appropriate patterns based on the current language
  const pricePatterns = currentLanguage === 'es' ? ES_PRICE_PATTERNS : EN_PRICE_PATTERNS;
  const weightPatterns = currentLanguage === 'es' ? ES_WEIGHT_PATTERNS : EN_WEIGHT_PATTERNS;
  const quantityPatterns = currentLanguage === 'es' ? ES_QUANTITY_PATTERNS : EN_QUANTITY_PATTERNS;
  const separatorKeywords = currentLanguage === 'es' ? ES_SEPARATOR_KEYWORDS : EN_SEPARATOR_KEYWORDS;
  const weightKeywords = currentLanguage === 'es' ? ES_WEIGHT_KEYWORDS : EN_WEIGHT_KEYWORDS;
  const actionWords = currentLanguage === 'es' ? ES_ACTION_WORDS : EN_ACTION_WORDS;

  // 1. Check for products by weight
  for (const pattern of weightPatterns) {
    const match = normalizedTranscript.match(pattern);
    if (match) {
      if (match[1] && match[2]) {
        // If has quantity and name
        name = `${match[2]} (${match[1]} kg)`.trim();
      } else if (match[1]) {
        // If only has quantity
        name = `(${match[1]} kg)`.trim();
      } else if (match[0]) {
        // If only has name
        name = `${match[1]} (1 kg)`.trim();
      }

      // Look for price after the weight part
      const remainingText = normalizedTranscript.replace(match[0], '').trim();

      // Look for price in the remaining text
      for (const pricePattern of pricePatterns) {
        const priceMatch = remainingText.match(pricePattern);
        if (priceMatch && priceMatch[1]) {
          price = priceMatch[1].replace(',', '.');
          break;
        }
      }

      return { name, price, quantity: "1" }; // Weight is already included in the name
    }
  }

  // 2. Check for specific quantities
  for (const pattern of quantityPatterns) {
    const match = normalizedTranscript.match(pattern);
    if (match && match[1] && (match[2] || match[3])) {
      quantity = match[1];

      // Get the product name
      if (match[3]) {
        name = match[3].trim(); // For pattern with specific unit
      } else {
        name = match[2].trim(); // For generic pattern
      }

      // Look for price in the remaining text
      const remainingText = normalizedTranscript.replace(match[0], '').trim();
      for (const pricePattern of pricePatterns) {
        const priceMatch = remainingText.match(pricePattern);
        if (priceMatch && priceMatch[1]) {
          price = priceMatch[1].replace(',', '.');
          break;
        }
      }
      
      return { name, price, quantity };
    }
  }

  // 3. Look for price using common patterns
  let foundPrice = false;
  let priceValue = '';
  for (const pattern of pricePatterns) {
    const match = normalizedTranscript.match(pattern);
    if (match && match[1]) {
      priceValue = match[1].replace(',', '.');
      foundPrice = true;

      // Extract name by removing the price part
      name = normalizedTranscript.replace(match[0], '').trim();
      break;
    }
  }
  
  if (foundPrice) {
    price = priceValue;
  } else {
    // 3. If no direct pattern, try splitting by keywords
    const words = normalizedTranscript.split(' ');
    let beforeSeparator: string[] = [];
    let afterSeparator: string[] = [];
    let foundSeparator = false;
    
    for (let i = 0; i < words.length; i++) {
      if (!foundSeparator && separatorKeywords.some(keyword => words[i].includes(keyword))) {
        foundSeparator = true;
        // Look for a number after the separator
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

    // If no separator found, use everything as name
    if (beforeSeparator.length > 0 && !foundSeparator) {
      name = beforeSeparator.join(' ');
    } else {
      name = beforeSeparator.join(' ');
    }
  }

  // 4. Clean up the final name by removing redundant keywords
  for (const keyword of [...separatorKeywords, ...weightKeywords]) {
    name = name.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '');
  }

  // Remove common action words
  for (const word of actionWords) {
    const regex = new RegExp(`^${word}\\s+`, 'i');
    name = name.replace(regex, '');
  }

  // Clean multiple spaces
  name = name.replace(/\s+/g, ' ').trim();

  // Show toast with what was understood
  if (name && price) {
    toast.success(currentLanguage === 'es' ? "Entrada por voz reconocida" : "Voice input recognized", {
      description: currentLanguage === 'es' 
        ? `"${name}" por ${price}€${quantity !== '1' ? ` (${quantity}x)` : ''}`
        : `"${name}" for ${price}€${quantity !== '1' ? ` (${quantity}x)` : ''}`
    });
  } else if (name) {
    toast.info(currentLanguage === 'es' ? "Producto reconocido, falta precio" : "Product recognized, missing price", {
      description: `"${name}"${quantity !== '1' ? ` (${quantity}x)` : ''}`
    });
  } else if (price) {
    toast.info(currentLanguage === 'es' ? "Precio reconocido, falta producto" : "Price recognized, missing product", {
      description: `${price}€`
    });
  } else {
    toast.warning(currentLanguage === 'es' ? "No se reconoció correctamente" : "Not recognized correctly", {
      description: currentLanguage === 'es' 
        ? "Intenta de nuevo con 'producto a precio'" 
        : "Try again with 'product at price'"
    });
  }

  return { name, price, quantity };
};
