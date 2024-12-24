import { create } from 'zustand';
import { Sprint, Resource, ResourceDailyCapacity, SprintResourceData } from '../types/sprint';
import { useScrumTeamStore } from './scrumTeamStore';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

const mapDailyCapacitiesToJson = (dailyCapacities: ResourceDailyCapacity[]): Json => {
  return dailyCapacities.map(dc => ({
    date: dc.date,
    capacity: dc.capacity
  })) as Json;
};

const mapJsonToDailyCapacities = (json: Json): ResourceDailyCapacity[] => {
  if (!Array.isArray(json)) return [];
  return json.map(item => {
    if (typeof item === 'object' && item !== null && 'date' in item && 'capacity' in item) {
      return {
        date: String(item.date),
        capacity: Number(item.capacity)
      };
    }
    return { date: '', capacity: 0 };
  });
};

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
        `)
        .order('start_date', { ascending: false });

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
            name: '', // Will be populated from the resources store when needed
            capacityPerDay: 1,
            dailyCapacities: mapJsonToDailyCapacities(sr.daily_capacities)
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
      console.log('Starting to add sprint with data:', sprint);

      // Create the sprint
      const { data: sprintData, error: sprintError } = await supabase
        .from('sprints')
        .insert({
          team_id: activeTeam.id,
          start_date: sprint.startDate,
          end_date: sprint.endDate,
          duration: sprint.duration,
          story_points_committed: sprint.storyPointsCommitted,
          theoretical_capacity: sprint.theoreticalCapacity,
          objective: sprint.objective
        })
        .select()
        .single();

      if (sprintError) {
        console.error('Error creating sprint:', sprintError);
        throw sprintError;
      }

      console.log('Sprint created successfully:', sprintData);

      // Prepare sprint_resources data
      const sprintResourcesData: SprintResourceData[] = sprint.resources.map(resource => ({
        sprint_id: sprintData.id,
        resource_id: resource.id,
        daily_capacities: mapDailyCapacitiesToJson(resource.dailyCapacities || [])
      }));

      console.log('Inserting sprint resources:', sprintResourcesData);

      // Insert sprint_resources one by one to better handle errors
      for (const resourceData of sprintResourcesData) {
        try {
          const { error: resourceError } = await supabase
            .from('sprint_resources')
            .insert(resourceData);

          if (resourceError) {
            console.error('Error inserting sprint resource:', resourceError);
            throw resourceError;
          }
        } catch (error) {
          console.error('Failed to insert sprint resource:', error);
          throw error;
        }
      }

      console.log('Sprint resources inserted successfully');

      const newSprint = {
        ...sprint,
        id: sprintData.id
      };

      set((state) => ({
        sprints: [newSprint, ...state.sprints],
        activeSprint: newSprint,
      }));

      toast.success('Sprint créé avec succès!');
    } catch (error) {
      console.error('Error adding sprint:', error);
      toast.error("Erreur lors de la création du sprint");
      throw error;
    }
  },

  updateSprint: async (sprintId, updatedFields) => {
    try {
      console.log('Starting updateSprint with ID:', sprintId);
      console.log('Updated fields:', updatedFields);

      // Update sprint basic info
      const { error: sprintError } = await supabase
        .from('sprints')
        .update({
          start_date: updatedFields.startDate,
          end_date: updatedFields.endDate,
          duration: updatedFields.duration,
          story_points_committed: updatedFields.storyPointsCommitted,
          story_points_completed: updatedFields.storyPointsCompleted,
          theoretical_capacity: updatedFields.theoreticalCapacity,
          objective: updatedFields.objective,
          objective_achieved: updatedFields.objectiveAchieved,
          velocity_achieved: updatedFields.velocityAchieved,
          commitment_respected: updatedFields.commitmentRespected,
          is_successful: updatedFields.isSuccessful
        })
        .eq('id', sprintId);

      if (sprintError) {
        console.error('Error updating sprint:', sprintError);
        throw sprintError;
      }

      set((state) => ({
        sprints: state.sprints.map((sprint) =>
          sprint.id === sprintId ? { ...sprint, ...updatedFields } : sprint
        ),
      }));

      console.log('Sprint store updated successfully');
      toast.success("Sprint mis à jour avec succès!");
    } catch (error) {
      console.error('Error in updateSprint:', error);
      toast.error("Erreur lors de la mise à jour du sprint");
      throw error;
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

      const { error } = await supabase
        .from('sprints')
        .update({
          story_points_completed: storyPointsCompleted,
          velocity_achieved: velocityAchieved,
          commitment_respected: commitmentRespected,
          is_successful: true
        })
        .eq('id', sprintId);

      if (error) throw error;

      set((state) => ({
        sprints: state.sprints.map((s) =>
          s.id === sprintId
            ? {
                ...s,
                storyPointsCompleted,
                velocityAchieved,
                commitmentRespected,
                isSuccessful: true
              }
            : s
        ),
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

    // Round to 2 decimal places to stay within the database field's precision
    return Number((averageVelocity * totalResourceCapacity).toFixed(2));
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
    return !teamSprints.some(s => s.storyPointsCompleted === undefined);
  },
}));
