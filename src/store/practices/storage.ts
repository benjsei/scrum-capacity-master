import { TeamPractices } from '@/types/agilePractice';

const STORAGE_KEY = 'team-practices';

export const getStoredPractices = (): TeamPractices[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const savePractices = (practices: TeamPractices[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(practices));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};