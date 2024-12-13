import { create } from 'zustand';
import { Sprint, Resource } from '../types/sprint';
import { useScrumTeamStore } from './scrumTeamStore';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface SprintStore {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  setSprints: (sprints: Sprint[]) => void;
  loadSprints: () => Promise<void>;
  addSprint: (sprint: Sprint) => Promise<void>;
  updateSprint: (sprintId: string, sprint: Partial<Sprint>) => Promise<void>;
  deleteSprint: (sprintId: string) => Promise<void>;
  completeSprint: (sprintId: string, storyPointsCompleted: number) => Promise<void>;
  calculateTheoreticalCapacity: (resources: Resource[], duration: number) => number;
  getAverageVelocity: () => number;
  getActiveTeamSprints: () => Sprint[];
  canCreateNewSprint: () => boolean;
}

export const useSprintStore = create<SprintStore>((set, get) => ({
  sprints: [],
  activeSprint: null,
  setSprints: (sprints) => set({ sprints }),

  loadSprints: async () => {
    try {
      const { data: sprintsData, error: sprintsError } = await supabase
        .from('sprints')
        .select(`
          *,
          sprint_resources (
            resource_id,
            daily_capacities
          )
        `);

      if (sprintsError) throw sprintsError;

      if (sprintsData) {
        const formattedSprints: Sprint[] = sprintsData.map(sprint => ({
          id: sprint.id,
          teamId: sprint.team_id || '',
          startDate: sprint.start_date,
          endDate: sprint.end_date,
          duration: sprint.duration,
          storyPointsCommitted: sprint.story_points_committed,
          storyPointsCompleted: sprint.story_points_completed,
          theoreticalCapacity: sprint.theoretical_capacity,
          velocityAchieved: sprint.velocity_achieved,
          commitmentRespected: sprint.commitment_respected,
          objective: sprint.objective || '',
          objectiveAchieved: sprint.objective_achieved,
          resources: sprint.sprint_resources.map((sr: any) => ({
            id: sr.resource_id,
            dailyCapacities: sr.daily_capacities || []
          }))
        }));
        set({ sprints: formattedSprints });
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
      toast.error("Erreur lors du chargement des sprints");
    }
  },

  addSprint: async (sprint) => {
    const activeTeam = useScrumTeamStore.getState().activeTeam;
    if (!activeTeam) {
      toast.error("No active team selected");
      return;
    }

    try {
      // Insert sprint
      const { data: sprintData, error: sprintError } = await supabase
        .from('sprints')
        .insert([{
          team_id: activeTeam.id,
          start_date: sprint.startDate,
          end_date: sprint.endDate,
          duration: sprint.duration,
          story_points_committed: sprint.storyPointsCommitted,
          theoretical_capacity: sprint.theoreticalCapacity,
          objective: sprint.objective
        }])
        .select()
        .single();

      if (sprintError) throw sprintError;
      if (!sprintData) throw new Error('No data returned from sprint insert');

      // Insert sprint resources
      const sprintResourcesData = sprint.resources.map(resource => ({
        sprint_id: sprintData.id,
        resource_id: resource.id,
        daily_capacities: JSON.stringify(resource.dailyCapacities || [])
      }));

      const { error: resourcesError } = await supabase
        .from('sprint_resources')
        .insert(sprintResourcesData);

      if (resourcesError) throw resourcesError;

      // Update local state
      const newSprint = {
        ...sprint,
        id: sprintData.id,
      };

      set((state) => ({
        sprints: [...state.sprints, newSprint],
        activeSprint: newSprint,
      }));

      toast.success('Sprint créé avec succès!');
    } catch (error) {
      console.error('Error adding sprint:', error);
      toast.error("Erreur lors de la création du sprint");
    }
  },

  updateSprint: async (sprintId, updatedFields) => {
    try {
      const { error: sprintError } = await supabase
        .from('sprints')
        .update({
          start_date: updatedFields.startDate,
          end_date: updatedFields.endDate,
          duration: updatedFields.duration,
          story_points_committed: updatedFields.storyPointsCommitted,
          theoretical_capacity: updatedFields.theoreticalCapacity,
          objective: updatedFields.objective,
          objective_achieved: updatedFields.objectiveAchieved
        })
        .eq('id', sprintId);

      if (sprintError) throw sprintError;

      if (updatedFields.resources) {
        // Update sprint resources
        const { error: deleteError } = await supabase
          .from('sprint_resources')
          .delete()
          .eq('sprint_id', sprintId);

        if (deleteError) throw deleteError;

        const sprintResourcesData = updatedFields.resources.map(resource => ({
          sprint_id: sprintId,
          resource_id: resource.id,
          daily_capacities: resource.dailyCapacities
        }));

        const { error: resourcesError } = await supabase
          .from('sprint_resources')
          .insert(sprintResourcesData);

        if (resourcesError) throw resourcesError;
      }

      set((state) => ({
        sprints: state.sprints.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, ...updatedFields } : sprint
        ),
      }));

      toast.success("Sprint mis à jour avec succès!");
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

      set((state) => ({
        sprints: state.sprints.filter((sprint) => sprint.id !== sprintId),
        activeSprint: state.activeSprint?.id === sprintId ? null : state.activeSprint,
      }));

      toast.success("Sprint supprimé avec succès!");
    } catch (error) {
      console.error('Error deleting sprint:', error);
      toast.error("Erreur lors de la suppression du sprint");
    }
  },

  completeSprint: async (sprintId, storyPointsCompleted) => {
    try {
      const sprint = get().sprints.find(s => s.id === sprintId);
      if (!sprint) throw new Error('Sprint not found');

      const velocityAchieved = storyPointsCompleted / sprint.duration;
      const commitmentRespected = (storyPointsCompleted / sprint.storyPointsCommitted) * 100;
      const isSuccessful = storyPointsCompleted >= sprint.storyPointsCommitted;

      const { error } = await supabase
        .from('sprints')
        .update({
          story_points_completed: storyPointsCompleted,
          velocity_achieved: velocityAchieved,
          commitment_respected: commitmentRespected
        })
        .eq('id', sprintId);

      if (error) throw error;

      set((state) => ({
        sprints: state.sprints.map((sprint) =>
          sprint.id === sprintId
            ? {
                ...sprint,
                storyPointsCompleted,
                velocityAchieved,
                commitmentRespected,
                isSuccessful
              }
            : sprint
        ),
        activeSprint: null,
      }));

      toast.success("Sprint terminé avec succès!");
    } catch (error) {
      console.error('Error completing sprint:', error);
      toast.error("Erreur lors de la complétion du sprint");
    }
  },

  calculateTheoreticalCapacity: (resources: Resource[], duration: number) => {
    const averageVelocity = get().getAverageVelocity();
    
    const totalResourceCapacity = resources.reduce((acc, resource) => {
      if (resource.dailyCapacities && resource.dailyCapacities.length > 0) {
        return acc + resource.dailyCapacities.reduce((sum, dc) => sum + dc.capacity, 0);
      }
      return acc + (resource.capacityPerDay * duration);
    }, 0);

    return averageVelocity * totalResourceCapacity;
  },

  getAverageVelocity: () => {
    const sprints = get().sprints;
    const completedSprints = sprints.filter(s => s.velocityAchieved !== undefined);
    
    if (completedSprints.length === 0) return 1; // Default velocity

    const totalVelocity = completedSprints.reduce((sum, sprint) => 
      sum + (sprint.velocityAchieved || 0), 0);
    
    return totalVelocity / completedSprints.length;
  },

  getActiveTeamSprints: () => {
    const activeTeam = useScrumTeamStore.getState().activeTeam;
    if (!activeTeam) return [];
    return get().sprints.filter(sprint => sprint.teamId === activeTeam.id);
  },

  canCreateNewSprint: () => {
    const activeTeam = useScrumTeamStore.getState().activeTeam;
    if (!activeTeam) return false;
    
    const teamSprints = get().getActiveTeamSprints();
    return !teamSprints.some(s => s.isSuccessful === undefined);
  },
}));