
import { identifyQuantities } from '@/lib/gemini-service';
import { toast } from "sonner";
import { processVoiceInputClassic } from './classic-processor';

/**
 * Process voice input using Gemini AI
 */
export const processVoiceInputWithAI = async (transcript: string, currentLanguage: string): Promise<{ 
  name?: string; 
  price?: string; 
  quantity?: string;
}> => {
  try {
    // Use Gemini to analyze voice input
    const result = await identifyQuantities(transcript, currentLanguage);
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

      // Show toast with what was understood
      const quantityText = item.quantity && item.quantity > 1 ? ` (${item.quantity}x)` : '';
      const priceText = item.price ? (currentLanguage === 'es' ? ` por ${item.price}€` : ` for ${item.price}€`) : '';
      toast.success(currentLanguage === 'es' ? "Entrada por voz reconocida" : "Voice input recognized", {
        description: `"${item.name}"${quantityText}${priceText}`
      });
      
      return response;
    }
    
    // If Gemini fails, use classic processing
    return processVoiceInputClassic(transcript, currentLanguage);
  } catch (error) {
    console.error("Error processing voice input with AI:", error);
    // Fallback to classic processing
    return processVoiceInputClassic(transcript, currentLanguage);
  }
};
