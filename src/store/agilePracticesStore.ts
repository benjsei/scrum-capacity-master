import { create } from 'zustand';
import { AgilePractice, TeamPractices } from '../types/agilePractice';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface AgilePracticesStore {
  teamPractices: TeamPractices[];
  initializePractices: (teamId: string, practices?: AgilePractice[]) => Promise<void>;
  togglePracticeCompletion: (teamId: string, practiceId: string) => void;
  updatePracticeUrl: (teamId: string, practiceId: string, url: string) => void;
  getPracticesForTeam: (teamId: string) => AgilePractice[];
  getPracticesProgress: (teamId: string) => number;
}

export const useAgilePracticesStore = create<AgilePracticesStore>((set, get) => ({
  teamPractices: [],

  initializePractices: async (teamId: string, practices?: AgilePractice[]) => {
    try {
      // First, check if team already has practices
      const { data: existingPractices } = await supabase
        .from('agile_practices')
        .select('*')
        .eq('team_id', teamId);

      if (existingPractices && existingPractices.length > 0) {
        // If team has practices, use them
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
          url: p.url
        }));

        set(state => ({
          teamPractices: [
            ...state.teamPractices.filter(tp => tp.teamId !== teamId),
            { teamId, practices: formattedPractices }
          ]
        }));
        return;
      }

      // If no practices exist, get default practices
      const { data: defaultPractices, error: defaultError } = await supabase
        .from('default_practices')
        .select('*');

      if (defaultError) throw defaultError;

      // Format default practices for insertion
      const practicesForInsertion = defaultPractices.map(p => ({
        team_id: teamId,
        day: p.day,
        who: p.who,
        type: p.type,
        action: p.action,
        sub_actions: p.sub_actions,
        format: p.format,
        duration: p.duration,
        is_completed: false
      }));

      // Insert default practices for the team
      const { data: insertedPractices, error: insertError } = await supabase
        .from('agile_practices')
        .insert(practicesForInsertion)
        .select();

      if (insertError) throw insertError;

      // Format inserted practices for state
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
        url: p.url
      }));

      set(state => ({
        teamPractices: [
          ...state.teamPractices.filter(tp => tp.teamId !== teamId),
          { teamId, practices: formattedPractices }
        ]
      }));

      toast.success("Pratiques agiles initialisées avec succès");
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
      const completedAt = newIsCompleted ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('agile_practices')
        .update({ 
          is_completed: newIsCompleted,
          completed_at: completedAt
        })
        .eq('id', practiceId);

      if (error) throw error;

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
                completedAt
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
      const { error } = await supabase
        .from('agile_practices')
        .update({ url })
        .eq('id', practiceId);

      if (error) throw error;

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

  getPracticesProgress: (teamId: string) => {
    const practices = get().getPracticesForTeam(teamId);
    if (practices.length === 0) return 0;
    return Math.round((practices.filter(p => p.isCompleted).length / practices.length) * 100);
  },
}));