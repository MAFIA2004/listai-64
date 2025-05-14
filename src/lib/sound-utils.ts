
// Sound utility functions for the shopping list app

export const playBudgetExceededSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.play().catch(error => {
    console.error('Error playing sound:', error);
  });
};
