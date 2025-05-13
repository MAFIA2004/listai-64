
// Gemini API service for shopping list app
// API key should be stored safely in a backend service, but for demo purposes it's here

const GEMINI_API_KEY = "AIzaSyC7LtWs9tYp3deRmfWA6AUUaUajc5KgU0k";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export interface GeminiResponse {
  categories: Record<string, string[]>;
  quantities?: Record<string, number>;
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
export async function identifyQuantities(transcript: string): Promise<GeminiResponse | undefined> {
  if (!transcript) return undefined;
  
  try {
    const prompt = `
      Act as a shopping list assistant that understands spoken Spanish. I will give you a sentence about buying items.
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
