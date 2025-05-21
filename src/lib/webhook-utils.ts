
/**
 * Sends a notification to the specified webhook
 * @param data Data to send in the webhook notification
 */
export const sendWebhookNotification = async (data: any): Promise<void> => {
  try {
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
    }
  } catch (error) {
    console.error("Error sending webhook notification:", error);
  }
};
