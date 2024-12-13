import { create } from 'zustand';
import { AgilePractice, TeamPractices } from '../types/agilePractice';

const STORAGE_KEY = 'team-practices';

const getStoredPractices = (): TeamPractices[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

const savePractices = (practices: TeamPractices[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(practices));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const initialPractices: AgilePractice[] = [];

interface AgilePracticesStore {
  teamPractices: TeamPractices[];
  initializePractices: (teamId: string, practices?: AgilePractice[]) => void;
  togglePracticeCompletion: (teamId: string, practiceId: string) => void;
  updatePracticeUrl: (teamId: string, practiceId: string, url: string) => void;
  getPracticesForTeam: (teamId: string) => AgilePractice[];
}

export const useAgilePracticesStore = create<AgilePracticesStore>((set, get) => ({
  teamPractices: getStoredPractices(),
  
  initializePractices: (teamId: string, practices?: AgilePractice[]) => {
    set((state) => {
      const practicesToUse = practices || initialPractices;
      const existingTeamIndex = state.teamPractices.findIndex(tp => tp.teamId === teamId);
      
      let newTeamPractices;
      if (existingTeamIndex >= 0) {
        newTeamPractices = [...state.teamPractices];
        newTeamPractices[existingTeamIndex] = { 
          teamId, 
          practices: practicesToUse
        };
      } else {
        newTeamPractices = [...state.teamPractices, { 
          teamId, 
          practices: practicesToUse 
        }];
      }
      
      savePractices(newTeamPractices);
      return { teamPractices: newTeamPractices };
    });
  },

  togglePracticeCompletion: (teamId: string, practiceId: string) => {
    set((state) => {
      const newTeamPractices = state.teamPractices.map(tp => {
        if (tp.teamId !== teamId) return tp;
        
        const newPractices = tp.practices.map(practice => {
          if (practice.id !== practiceId) return practice;
          
          return {
            ...practice,
            isCompleted: !practice.isCompleted,
            completedAt: !practice.isCompleted ? new Date().toISOString() : undefined
          };
        });
        
        return { ...tp, practices: newPractices };
      });
      
      savePractices(newTeamPractices);
      return { teamPractices: newTeamPractices };
    });
  },

  updatePracticeUrl: (teamId: string, practiceId: string, url: string) => {
    set((state) => {
      const newTeamPractices = state.teamPractices.map(tp => {
        if (tp.teamId !== teamId) return tp;
        
        const newPractices = tp.practices.map(practice => {
          if (practice.id !== practiceId) return practice;
          return { ...practice, url };
        });
        
        return { ...tp, practices: newPractices };
      });
      
      savePractices(newTeamPractices);
      return { teamPractices: newTeamPractices };
    });
  },

  getPracticesForTeam: (teamId: string) => {
    const teamPractice = get().teamPractices.find(tp => tp.teamId === teamId);
    return teamPractice?.practices || [];
  },
}));