/**
 * Sends a notification to the specified webhook and returns the response
 * @param data Data to send in the webhook notification
 * @returns The webhook response data or null if an error occurred
 */
export const sendWebhookNotification = async (data: any): Promise<any> => {
  try {
    // Using the provided webhook URL
    const WEBHOOK_URL = "https://n8n-ww7l.onrender.com/webhook/860a346e-3286-45b7-bc20-1fdb56b6ae61";
    
    console.log("Sending notification to webhook:", data);
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: data }), // Wrap the data in a prompt field
    });
    
    if (!response.ok) {
      console.error("Webhook notification failed:", await response.text());
      return null;
    }
    
    // Parse and return the response data
    try {
      const responseData = await response.json();
      console.log("Webhook response:", responseData);
      return responseData;
    } catch (error) {
      // If it's not JSON, try returning the text directly
      const textResponse = await response.text();
      console.log("Webhook text response:", textResponse);
      return textResponse;
    }
  } catch (error) {
    console.error("Error sending webhook notification:", error);
    return null;
  }
};

/**
 * Parse webhook response to extract description and ingredients
 * @param response The webhook response string or object
 * @returns Object containing description and ingredients array
 */
export const parseWebhookResponse = (response: any): { description: string, ingredients: string[] } => {
  // Default values
  let description = '';
  let ingredients: string[] = [];
  
  try {
    // If response is already a parsed object, try to use it directly
    if (typeof response === 'object' && response !== null) {
      // Looking for output field in the response based on the logs
      if (response.output) {
        const outputText = response.output.trim();
        
        // Try to extract ingredients from the output text
        // For this specific webhook, we need to check if there's an error message
        if (outputText.includes("no es una receta válida") || 
            outputText.includes("No puedo procesar la solicitud")) {
          console.log("Webhook returned an error message");
          return { description, ingredients };
        }
        
        // If it's not an error, use the output as description or extract ingredients
        const lines = outputText.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length > 0) {
          description = lines[0];
          
          // If there are more lines, they might contain ingredients
          if (lines.length > 1) {
            // Look for lines that might be ingredients (e.g., "- Ingredient")
            const ingredientLines = lines.slice(1).filter(line => 
              line.trim().startsWith('-') || line.includes(':')
            );
            
            if (ingredientLines.length > 0) {
              ingredients = ingredientLines.map(line => 
                line.replace(/^-\s*/, '').trim()
              );
            } else {
              // If no ingredient format is found, use the remaining text as a single ingredient
              ingredients = [lines.slice(1).join(' ').trim()];
            }
          }
        }
        
        return { description, ingredients };
      }
      
      // Standard format check (fallback)
      if (response.description) {
        description = response.description;
      }
      
      if (Array.isArray(response.ingredients)) {
        ingredients = response.ingredients;
      }
    }
    
    // If response is string, try to parse it (keeping the existing parsing logic as fallback)
    if (typeof response === 'string') {
      // Extract description enclosed in parentheses
      const descMatch = response.match(/\((.*?)\)/);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
      }
      
      // Extract ingredients enclosed in quotes
      const ingredientsMatch = response.match(/"([^"]*)"/);
      if (ingredientsMatch && ingredientsMatch[1]) {
        // Split by commas and trim each ingredient
        ingredients = ingredientsMatch[1].split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
    }
    
    // Fallback: If no ingredients found but we have a non-empty string, use it as a single ingredient
    if (ingredients.length === 0 && typeof response === 'string' && response.trim() !== '') {
      ingredients = [response.trim()];
    }
    
    return { description, ingredients };
  } catch (error) {
    console.error("Error parsing webhook response:", error);
    return { description, ingredients };
  }
};
