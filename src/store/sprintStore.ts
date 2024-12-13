import { create } from 'zustand';
import { Sprint, Resource, ResourceDailyCapacity } from '../types/sprint';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface SprintStore {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  setActiveSprint: (sprint: Sprint | null) => void;
  setSprints: (sprints: Sprint[]) => void;
  loadSprints: () => Promise<void>;
  addSprint: (sprint: Sprint) => Promise<void>;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => Promise<void>;
  deleteSprint: (sprintId: string) => Promise<void>;
  getSprintsForTeam: (teamId: string) => Sprint[];
}

export const useSprintStore = create<SprintStore>((set, get) => ({
  sprints: [],
  activeSprint: null,
  setActiveSprint: (sprint) => set({ activeSprint: sprint }),
  setSprints: (sprints) => set({ sprints }),

  loadSprints: async () => {
    try {
      const { data: sprints, error } = await supabase
        .from('sprints')
        .select(`
          *,
          sprint_resources (
            resource_id,
            daily_capacities
          )
        `);

      if (error) throw error;

      set({ sprints: sprints.map(sprint => ({
        id: sprint.id,
        teamId: sprint.team_id,
        startDate: sprint.start_date,
        endDate: sprint.end_date,
        duration: sprint.duration,
        storyPointsCommitted: sprint.story_points_committed,
        storyPointsCompleted: sprint.story_points_completed,
        theoreticalCapacity: sprint.theoretical_capacity,
        velocityAchieved: sprint.velocity_achieved,
        commitmentRespected: sprint.commitment_respected,
        objective: sprint.objective,
        objectiveAchieved: sprint.objective_achieved,
        isSuccessful: sprint.is_successful,
        createdAt: sprint.created_at,
        resources: sprint.sprint_resources || []
      })) });
    } catch (error) {
      console.error('Error loading sprints:', error);
      toast.error("Erreur lors du chargement des sprints");
    }
  },

  addSprint: async (sprint) => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert([{
          team_id: sprint.teamId,
          start_date: sprint.startDate,
          end_date: sprint.endDate,
          duration: sprint.duration,
          story_points_committed: sprint.storyPointsCommitted,
          theoretical_capacity: sprint.theoreticalCapacity,
          objective: sprint.objective
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      // Insert sprint resources
      if (sprint.resources && sprint.resources.length > 0) {
        const sprintResources = sprint.resources.map(resource => ({
          sprint_id: data.id,
          resource_id: resource.id,
          daily_capacities: resource.dailyCapacities || []
        }));

        const { error: resourcesError } = await supabase
          .from('sprint_resources')
          .insert(sprintResources);

        if (resourcesError) throw resourcesError;
      }

      set(state => ({
        sprints: [...state.sprints, { ...sprint, id: data.id }]
      }));

      toast.success("Sprint créé avec succès");
    } catch (error) {
      console.error('Error adding sprint:', error);
      toast.error("Erreur lors de la création du sprint");
    }
  },

  updateSprint: async (sprintId, updates) => {
    try {
      const { error } = await supabase
        .from('sprints')
        .update({
          story_points_completed: updates.storyPointsCompleted,
          velocity_achieved: updates.velocityAchieved,
          commitment_respected: updates.commitmentRespected,
          objective_achieved: updates.objectiveAchieved,
          is_successful: updates.isSuccessful
        })
        .eq('id', sprintId);

      if (error) throw error;

      set(state => ({
        sprints: state.sprints.map(sprint =>
          sprint.id === sprintId ? { ...sprint, ...updates } : sprint
        )
      }));

      toast.success("Sprint mis à jour avec succès");
    } catch (error) {
      console.error('Error updating sprint:', error);
      toast.error("Erreur lors de la mise à jour du sprint");
    }
  },

  deleteSprint: async (sprintId) => {
    try {
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', sprintId);

      if (error) throw error;

      set(state => ({
        sprints: state.sprints.filter(sprint => sprint.id !== sprintId),
        activeSprint: state.activeSprint?.id === sprintId ? null : state.activeSprint
      }));

      toast.success("Sprint supprimé avec succès");
    } catch (error) {
      console.error('Error deleting sprint:', error);
      toast.error("Erreur lors de la suppression du sprint");
    }
  },

  getSprintsForTeam: (teamId) => {
    return get().sprints.filter(sprint => sprint.teamId === teamId);
  },
}));