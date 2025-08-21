/**
 * Storage utility functions for saving and loading data from localStorage
 */

/**
 * Save data to localStorage with SportFlare prefix
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`sportflare_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

/**
 * Load data from localStorage with SportFlare prefix
 */
export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(`sportflare_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return null;
  }
};