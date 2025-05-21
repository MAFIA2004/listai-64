
/**
 * Sends a notification to the specified webhook and returns the response
 * @param data Data to send in the webhook notification
 * @returns The webhook response data or null if an error occurred
 */
export const sendWebhookNotification = async (data: any): Promise<any> => {
  try {
    // Using the provided webhook URL
    const WEBHOOK_URL = "https://n8n-ww7l.onrender.com/webhook/89a279ce-3317-43e0-9e01-f8bfd2c18693";
    
    console.log("Sending notification to webhook:", data);
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: data }), // Wrap the data in a prompt field
    });
    
    if (!response.ok) {
      console.error("Webhook notification failed with status:", response.status);
      return null;
    }
    
    // Only try to read the response body once
    try {
      const responseClone = response.clone(); // Clone the response before reading
      const responseData = await response.json();
      console.log("Webhook JSON response:", responseData);
      return responseData;
    } catch (error) {
      // If it's not JSON, try returning the text directly from the cloned response
      try {
        const responseClone = response.clone();
        const textResponse = await responseClone.text();
        console.log("Webhook text response:", textResponse);
        return textResponse;
      } catch (textError) {
        console.error("Error reading response as text:", textError);
        return null;
      }
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
    console.log("Parsing webhook response:", response);
    
    // If response is already a parsed object, try to use it directly
    if (typeof response === 'object' && response !== null) {
      // Looking for output field in the response based on the logs
      if (response.output) {
        const outputText = response.output.trim();
        console.log("Found output field:", outputText);
        
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
          // Extract description without parentheses
          let firstLine = lines[0];
          // Remove parentheses if they exist
          if (firstLine.startsWith('(') && firstLine.endsWith(')')) {
            firstLine = firstLine.substring(1, firstLine.length - 1);
          }
          description = firstLine.trim();
          
          // If there are more lines, they might contain ingredients
          if (lines.length > 1) {
            // Look for ingredients in quotes
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              // Extract content inside quotes if present
              const quoteMatch = line.match(/"([^"]*)"/);
              
              if (quoteMatch && quoteMatch[1]) {
                // Split by commas and process each ingredient
                const extractedIngredients = quoteMatch[1]
                  .split(',')
                  .map(item => item.trim())
                  .filter(item => item.length > 0);
                
                // Add each ingredient individually to the ingredients array
                ingredients = extractedIngredients;
              } else if (line.trim() !== '') {
                // If no quotes, add the line as is (might be a single ingredient)
                ingredients.push(line.trim());
              }
            }
          }
        }
        
        return { description, ingredients };
      }
      
      // Standard format check (fallback)
      if (response.description) {
        // Remove parentheses if they exist
        let desc = response.description;
        if (desc.startsWith('(') && desc.endsWith(')')) {
          desc = desc.substring(1, desc.length - 1);
        }
        description = desc.trim();
      }
      
      if (Array.isArray(response.ingredients)) {
        ingredients = response.ingredients;
      }
      
      // Last resort: try to find any array in the response
      for (const key in response) {
        if (Array.isArray(response[key]) && response[key].length > 0) {
          ingredients = response[key].map(item => 
            typeof item === 'string' ? item.trim() : JSON.stringify(item)
          );
          break;
        }
      }
    }
    
    // If response is string, try to parse it (keeping the existing parsing logic as fallback)
    if (typeof response === 'string') {
      try {
        // Try to parse as JSON first
        const parsedJson = JSON.parse(response);
        return parseWebhookResponse(parsedJson); // Recursively parse the JSON object
      } catch (e) {
        // Not valid JSON, continue with string parsing
        
        // Extract description enclosed in parentheses but remove the parentheses
        const descMatch = response.match(/\((.*?)\)/);
        if (descMatch && descMatch[1]) {
          description = descMatch[1].trim();
        }
        
        // Extract ingredients enclosed in quotes and split them individually
        const ingredientsMatch = response.match(/"([^"]*)"/);
        if (ingredientsMatch && ingredientsMatch[1]) {
          // Split by commas and trim each ingredient
          ingredients = ingredientsMatch[1]
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        }
        
        // If no structured format found, try to split by lines
        if (ingredients.length === 0) {
          const lines = response.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
          
          if (lines.length > 0) {
            // First line could be the description (remove parentheses if present)
            let firstLine = lines[0];
            if (firstLine.startsWith('(') && firstLine.endsWith(')')) {
              firstLine = firstLine.substring(1, firstLine.length - 1);
            }
            description = description || firstLine.trim();
            
            // Rest could be ingredients - split by commas if needed
            if (lines.length > 1) {
              for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes(',')) {
                  // If the line contains commas, split it into multiple ingredients
                  const lineIngredients = line
                    .split(',')
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
                  ingredients.push(...lineIngredients);
                } else if (line.trim() !== '') {
                  ingredients.push(line.trim());
                }
              }
            }
          }
        }
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
