
// Gemini API service for shopping list app
// API key should be stored safely in a backend service, but for demo purposes it's here

const GEMINI_API_KEY = "AIzaSyDafRYpORUnWBbqXcs2yBR8sFCN9L7d3n0"; // Updated API key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface GeminiResponse {
  categories?: Record<string, string[]>;
  quantities?: Record<string, number>;
  items?: Array<{
    name: string;
    quantity?: number;
    price?: number;
  }>;
  ingredients?: Array<{
    name: string;
    quantity?: number;
    price?: number;
  }>;
}

/**
 * Uses Gemini AI to categorize shopping items
 */
export async function categorizeItems(items: string[]): Promise<GeminiResponse | undefined> {
  if (!items.length) return undefined;
  
  try {
    const prompt = `
      Act as a shopping list assistant. I will give you a list of grocery items. 
      Group them into logical categories like "fruits", "vegetables", "dairy", "meat", "cleaning", etc.
      Return your response ONLY as a JSON object with the following format:
      {
        "categories": {
          "category1": ["item1", "item2"],
          "category2": ["item3", "item4"]
        }
      }
      
      Here are the items to categorize:
      ${items.join(', ')}
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return undefined;
    }

    const data = await response.json();
    
    // Extract JSON from the response text
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData;
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error categorizing items:', error);
    return undefined;
  }
}

/**
 * Uses Gemini AI to identify quantities in voice input
 */
export async function identifyQuantities(transcript: string, language: string = 'es'): Promise<GeminiResponse | undefined> {
  if (!transcript) return undefined;
  
  try {
    const prompt = `
      Act as a shopping list assistant that understands spoken ${language === 'es' ? 'Spanish' : 'English'}. I will give you a sentence about buying items.
      Identify the following:
      1. The product name(s)
      2. The quantity of each product (default to 1 if not specified)
      3. Any price information
      
      Return your response ONLY as a JSON object with the following format:
      {
        "items": [
          {"name": "product name", "quantity": number, "price": number or null}
        ]
      }
      
      Here is the transcript:
      "${transcript}"
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return undefined;
    }

    const data = await response.json();
    
    // Extract JSON from the response text
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData;
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error analyzing voice input:', error);
    return undefined;
  }
}

/**
 * Uses Gemini AI to generate recipe suggestions
 */
export async function getAIRecipeSuggestions(request: string, language: string = 'es'): Promise<GeminiResponse | undefined> {
  if (!request) return undefined;
  
  try {
    console.log("Starting AI recipe suggestion request for:", request);
    
    const prompt = language === 'es' ? `
      Actúa como un asistente de cocina en español que ayuda con listas de compras. Basado en mi solicitud,
      sugiere una lista de ingredientes necesarios para la receta o comida que quiero preparar.
      Para cada ingrediente, proporciona:
      1. El nombre del ingrediente en español
      2. Cantidad aproximada necesaria
      3. Precio estimado en euros (haz una estimación razonable)
      
      No incluyas agua en la lista de ingredientes, ya que se asume que el usuario la tiene.
      
      Devuelve tu respuesta SOLO como un objeto JSON con el siguiente formato:
      {
        "ingredients": [
          {"name": "nombre del ingrediente", "quantity": número, "price": número}
        ]
      }
      
      Aquí está mi solicitud:
      "${request}"
    ` : `
      Act as a kitchen assistant in English that helps with shopping lists. Based on my request,
      suggest a list of ingredients needed for the recipe or meal I want to prepare.
      For each ingredient, provide:
      1. The name of the ingredient in English
      2. Approximate quantity needed
      3. Estimated price in euros (make a reasonable estimate)
      
      Don't include water in the ingredients list, as it is assumed the user has it.
      
      Return your response ONLY as a JSON object with the following format:
      {
        "ingredients": [
          {"name": "ingredient name", "quantity": number, "price": number}
        ]
      }
      
      Here's my request:
      "${request}"
    `;

    console.log("Sending request to Gemini API...");
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    console.log("Received response from Gemini API, status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return undefined;
    }

    const data = await response.json();
    console.log("API response data:", data);
    
    // Extract JSON from the response text
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = data.candidates[0].content.parts[0].text;
      console.log("Raw Gemini response text:", text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[0]);
          console.log("Successfully parsed JSON:", parsedData);
          return parsedData;
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          console.log("Failed JSON string:", jsonMatch[0]);
          return undefined;
        }
      } else {
        console.error("No JSON pattern found in response");
      }
    } else {
      console.error("Missing expected data structure in API response");
    }
    
    return undefined;
  } catch (error) {
    console.error('Error generating recipe suggestions:', error);
    return undefined;
  }
}
