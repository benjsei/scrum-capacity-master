import { create } from 'zustand';
import { AgilePractice, TeamPractices } from '../types/agilePractice';

interface AgilePracticesStore {
  teamPractices: TeamPractices[];
  initializePractices: (teamId: string, practices: AgilePractice[]) => void;
  togglePracticeCompletion: (teamId: string, practiceId: string) => void;
  updatePracticeUrl: (teamId: string, practiceId: string, url: string) => void;
  getPracticesForTeam: (teamId: string) => AgilePractice[];
}

export const useAgilePracticesStore = create<AgilePracticesStore>((set, get) => ({
  teamPractices: [],
  
  initializePractices: (teamId: string, practices: AgilePractice[]) => {
    set((state) => {
      const existingTeamIndex = state.teamPractices.findIndex(tp => tp.teamId === teamId);
      if (existingTeamIndex >= 0) {
        const newTeamPractices = [...state.teamPractices];
        newTeamPractices[existingTeamIndex] = { teamId, practices };
        return { teamPractices: newTeamPractices };
      }
      return {
        teamPractices: [...state.teamPractices, { teamId, practices }]
      };
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
      
      return { teamPractices: newTeamPractices };
    });
  },

  getPracticesForTeam: (teamId: string) => {
    const teamPractice = get().teamPractices.find(tp => tp.teamId === teamId);
    return teamPractice?.practices || [];
  },
}));