
/**
 * Sends a notification to the specified webhook and returns the response
 * @param data Data to send in the webhook notification
 * @returns The webhook response data or null if an error occurred
 */
export const sendWebhookNotification = async (data: any): Promise<any> => {
  try {
    // Updated webhook URL as requested
    const WEBHOOK_URL = "https://n8n-ww7l.onrender.com/webhook/860a346e-3286-45b7-bc20-1fdb56b6ae61";
    
    console.log("Sending notification to webhook:", data);
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.error("Webhook notification failed:", await response.text());
      return null;
    }
    
    // Parse and return the response data
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error sending webhook notification:", error);
    return null;
  }
};

/**
 * Parse webhook response to extract description and ingredients
 * @param response The webhook response string
 * @returns Object containing description and ingredients array
 */
export const parseWebhookResponse = (response: string): { description: string, ingredients: string[] } => {
  // Default values
  let description = '';
  let ingredients: string[] = [];
  
  try {
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
    
    return { description, ingredients };
  } catch (error) {
    console.error("Error parsing webhook response:", error);
    return { description, ingredients };
  }
};
