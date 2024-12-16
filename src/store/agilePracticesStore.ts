import { create } from 'zustand';
import { toast } from "sonner";
import { AgilePracticesStore } from './practices/types';
import { getStoredPractices, savePractices } from './practices/storage';
import { 
  fetchTeamPractices, 
  fetchDefaultPractices, 
  createTeamPractices,
  updatePracticeCompletion,
  updatePracticeUrlInDb
} from './practices/supabaseUtils';

export const useAgilePracticesStore = create<AgilePracticesStore>((set, get) => ({
  teamPractices: getStoredPractices(),
  
  initializePractices: async (teamId: string) => {
    try {
      // Vérifie si l'équipe a déjà des pratiques
      const { data: existingPractices } = await fetchTeamPractices(teamId);

      // Si l'équipe n'a pas de pratiques, copie les pratiques par défaut
      if (!existingPractices || existingPractices.length === 0) {
        const defaultPractices = await fetchDefaultPractices();
        const insertedPractices = await createTeamPractices(teamId, defaultPractices);
        
        const formattedPractices = insertedPractices.map(p => ({
          id: p.id,
          day: p.day,
          who: p.who,
          type: p.type,
          action: p.action,
          subActions: p.sub_actions || '',
          format: p.format || '',
          duration: p.duration || '',
          isCompleted: p.is_completed || false,
          completedAt: p.completed_at,
          url: p.url,
          description: p.description || ''
        }));

        set(state => ({
          teamPractices: [
            ...state.teamPractices.filter(tp => tp.teamId !== teamId),
            { teamId, practices: formattedPractices }
          ]
        }));

        toast.success("Pratiques agiles initialisées avec succès");
      } else {
        // Si l'équipe a déjà des pratiques, les charge simplement
        const formattedPractices = existingPractices.map(p => ({
          id: p.id,
          day: p.day,
          who: p.who,
          type: p.type,
          action: p.action,
          subActions: p.sub_actions || '',
          format: p.format || '',
          duration: p.duration || '',
          isCompleted: p.is_completed || false,
          completedAt: p.completed_at,
          url: p.url,
          description: p.description || ''
        }));

        set(state => ({
          teamPractices: [
            ...state.teamPractices.filter(tp => tp.teamId !== teamId),
            { teamId, practices: formattedPractices }
          ]
        }));
      }
    } catch (error) {
      console.error('Error initializing practices:', error);
      toast.error("Erreur lors de l'initialisation des pratiques");
    }
  },

  togglePracticeCompletion: async (teamId: string, practiceId: string) => {
    try {
      const practice = get().getPracticesForTeam(teamId).find(p => p.id === practiceId);
      if (!practice) return;

      const newIsCompleted = !practice.isCompleted;
      await updatePracticeCompletion(practiceId, newIsCompleted);

      set((state) => ({
        teamPractices: state.teamPractices.map(tp => {
          if (tp.teamId !== teamId) return tp;
          
          return {
            ...tp,
            practices: tp.practices.map(practice => {
              if (practice.id !== practiceId) return practice;
              
              return {
                ...practice,
                isCompleted: newIsCompleted,
                completedAt: newIsCompleted ? new Date().toISOString() : null
              };
            })
          };
        })
      }));
    } catch (error) {
      console.error('Error toggling practice completion:', error);
      toast.error("Erreur lors de la mise à jour de la pratique");
    }
  },

  updatePracticeUrl: async (teamId: string, practiceId: string, url: string) => {
    try {
      await updatePracticeUrlInDb(practiceId, url);

      set((state) => ({
        teamPractices: state.teamPractices.map(tp => {
          if (tp.teamId !== teamId) return tp;
          
          return {
            ...tp,
            practices: tp.practices.map(practice => {
              if (practice.id !== practiceId) return practice;
              return { ...practice, url };
            })
          };
        })
      }));
    } catch (error) {
      console.error('Error updating practice URL:', error);
      toast.error("Erreur lors de la mise à jour de l'URL");
    }
  },

  getPracticesForTeam: (teamId: string) => {
    const teamPractice = get().teamPractices.find(tp => tp.teamId === teamId);
    return teamPractice?.practices || [];
  },
}));