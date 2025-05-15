
import { format } from 'date-fns';

// Get today's date in yyyy-MM-dd format
export const getTodayDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// Get the last saved date from localStorage
export const getLastSavedDate = (): string => {
  return localStorage.getItem('lastShoppingDate') || '';
};

// Set the last saved date to today
export const updateLastSavedDate = (): void => {
  localStorage.setItem('lastShoppingDate', getTodayDateString());
};
