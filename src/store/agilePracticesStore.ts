import { create } from 'zustand';
import { AgilePractice, TeamPractices } from '../types/agilePractice';

const initialPractices: AgilePractice[] = [
  {
    id: '1',
    day: 'N',
    who: 'COLLECTIF',
    type: 'ETAT D\'ESPRIT',
    action: 'ONE TEAM',
    subActions: '',
    format: 'ATELIER',
    duration: '',
    isCompleted: false
  },
  {
    id: '2',
    day: 'N',
    who: 'COLLECTIF',
    type: 'ETAT D\'ESPRIT',
    action: 'CONSTRUIRE ENSEMBLE',
    subActions: '',
    format: 'ATELIER',
    duration: '',
    isCompleted: false
  },
  // ... all other practices following the same pattern
  {
    id: '3',
    day: 'N',
    who: 'COLLECTIF',
    type: 'ETAT D\'ESPRIT',
    action: 'PARTAGE RESPECT ET RESPONSABILITES',
    subActions: '',
    format: 'ATELIER',
    duration: '',
    isCompleted: false
  },
  {
    id: '4',
    day: 'N',
    who: 'COLLECTIF',
    type: 'ETAT D\'ESPRIT',
    action: 'Casser les silos',
    subActions: 'Dev n\'est pas que DEV (Posture)',
    format: 'ATELIER',
    duration: '',
    isCompleted: false
  },
  {
    id: '5',
    day: 'N',
    who: 'COLLECTIF',
    type: 'ETAT D\'ESPRIT',
    action: 'Casser les silos',
    subActions: 'Métier embarqué dans la méthodo',
    format: 'ATELIER',
    duration: '',
    isCompleted: false
  },
  {
    id: '6',
    day: 'N+1',
    who: 'SCRUM MASTER',
    type: 'ACTIONS',
    action: 'Mise en place du cadre (JIRA/KPI)',
    subActions: 'Configuration Scrum Board simple tourné vers les DEV et l\'objectif de sprint',
    format: 'ACTION',
    duration: '30 min',
    isCompleted: false
  },
  {
    id: '7',
    day: 'N+5',
    who: 'SCRUM MASTER',
    type: 'ACTIONS',
    action: 'Mettre en place l\'outilage',
    subActions: 'Créer un template d\'US',
    format: 'ATELIER',
    duration: '30 min',
    isCompleted: false
  },
  {
    id: '8',
    day: 'N+14',
    who: 'COLLECTIF',
    type: 'ACTIONS',
    action: 'OKR',
    subActions: 'Mettre en place des OKR choisis collectivement',
    format: 'ATELIER',
    duration: '1 heure',
    isCompleted: false
  }
];

interface AgilePracticesStore {
  teamPractices: TeamPractices[];
  initializePractices: (teamId: string, practices?: AgilePractice[]) => void;
  togglePracticeCompletion: (teamId: string, practiceId: string) => void;
  updatePracticeUrl: (teamId: string, practiceId: string, url: string) => void;
  getPracticesForTeam: (teamId: string) => AgilePractice[];
}

export const useAgilePracticesStore = create<AgilePracticesStore>((set, get) => ({
  teamPractices: [],
  
  initializePractices: (teamId: string, practices?: AgilePractice[]) => {
    set((state) => {
      // Si des pratiques sont fournies, on les utilise, sinon on utilise les pratiques initiales
      const practicesToUse = practices ? practices.map(p => ({
        ...p,
        isCompleted: false // Réinitialise l'état de complétion
      })) : initialPractices;

      // Trouve l'index de l'équipe si elle existe déjà
      const existingTeamIndex = state.teamPractices.findIndex(tp => tp.teamId === teamId);
      
      if (existingTeamIndex >= 0) {
        // Met à jour les pratiques de l'équipe existante
        const newTeamPractices = [...state.teamPractices];
        newTeamPractices[existingTeamIndex] = { 
          teamId, 
          practices: practicesToUse
        };
        return { teamPractices: newTeamPractices };
      }

      // Ajoute une nouvelle équipe avec ses pratiques
      return {
        teamPractices: [...state.teamPractices, { 
          teamId, 
          practices: practicesToUse 
        }]
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