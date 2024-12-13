import { create } from 'zustand';
import { ScrumTeam } from '../types/scrumTeam';
import { Resource } from '../types/sprint';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface ScrumTeamStore {
  teams: ScrumTeam[];
  activeTeam: ScrumTeam | null;
  setActiveTeam: (team: ScrumTeam | null) => void;
  setTeams: (teams: ScrumTeam[]) => void;
  loadTeams: () => Promise<void>;
  addTeam: (team: ScrumTeam) => void;
  deleteTeam: (teamId: string) => void;
  updateTeamName: (teamId: string, newName: string) => void;
  addResource: (teamId: string, resource: Resource) => void;
  updateResource: (teamId: string, resourceId: string, updates: Partial<Resource>) => void;
  deleteResource: (teamId: string, resourceId: string) => void;
}

export const useScrumTeamStore = create<ScrumTeamStore>((set, get) => ({
  teams: [],
  activeTeam: null,
  setActiveTeam: (team) => set({ activeTeam: team }),
  setTeams: (teams) => set({ teams }),
  
  loadTeams: async () => {
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          *,
          resources (*)
        `);

      if (error) throw error;

      set({ teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        resources: team.resources.map(resource => ({
          id: resource.id,
          name: resource.name,
          capacityPerDay: resource.capacity_per_day || 1,
          teamId: resource.team_id
        })) || [],
        createdAt: team.created_at
      })) });
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  },

  addTeam: async (team) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name: team.name }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      set((state) => ({ 
        teams: [...state.teams, { ...team, id: data.id }] 
      }));
    } catch (error) {
      console.error('Error adding team:', error);
    }
  },

  deleteTeam: async (teamId) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      set((state) => ({
        teams: state.teams.filter((team) => team.id !== teamId),
        activeTeam: state.activeTeam?.id === teamId ? null : state.activeTeam,
      }));
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  },

  updateTeamName: async (teamId, newName) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ name: newName })
        .eq('id', teamId);

      if (error) throw error;

      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId ? { ...team, name: newName } : team
        ),
        activeTeam: state.activeTeam?.id === teamId 
          ? { ...state.activeTeam, name: newName }
          : state.activeTeam,
      }));
    } catch (error) {
      console.error('Error updating team name:', error);
    }
  },

  addResource: async (teamId, resource) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          name: resource.name,
          capacity_per_day: resource.capacityPerDay,
          team_id: teamId
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId
            ? { ...team, resources: [...team.resources, { ...resource, id: data.id }] }
            : team
        ),
      }));
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  },

  updateResource: async (teamId, resourceId, updates) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          name: updates.name,
          capacity_per_day: updates.capacityPerDay
        })
        .eq('id', resourceId);

      if (error) throw error;

      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                resources: team.resources.map((resource) =>
                  resource.id === resourceId
                    ? { ...resource, ...updates }
                    : resource
                ),
              }
            : team
        ),
      }));
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  },

  deleteResource: async (teamId, resourceId) => {
    try {
      // First, delete any sprint_resources entries that reference this resource
      const { error: sprintResourcesError } = await supabase
        .from('sprint_resources')
        .delete()
        .eq('resource_id', resourceId);

      if (sprintResourcesError) throw sprintResourcesError;

      // Then delete the resource itself
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                resources: team.resources.filter((r) => r.id !== resourceId),
              }
            : team
        ),
      }));

      toast.success("Ressource supprimée avec succès");
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error("Erreur lors de la suppression de la ressource");
    }
  },
}));
