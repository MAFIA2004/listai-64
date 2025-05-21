
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendWebhookNotification } from '@/lib/utils';

interface FloatingAIButtonProps {
  onClick: () => void;
}

export function FloatingAIButton({ onClick }: FloatingAIButtonProps) {
  const handleClick = () => {
    // Send webhook notification when AI button is clicked
    sendWebhookNotification({
      action: "ai_button_clicked",
      timestamp: new Date().toISOString()
    });
    
    // Call the original onClick handler
    onClick();
  };

  return (
    <Button onClick={handleClick} className="floating-button">
      <Sparkles className="h-5 w-5" />
      <span className="sr-only">Asistente IA</span>
    </Button>
  );
}
