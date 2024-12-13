import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { SprintStore, SprintResourceData } from './types';
import { convertDailyCapacitiesToJson, calculateSprintSuccess } from './utils';
import { useScrumTeamStore } from '../scrumTeamStore';

export const useSprintStore = create<SprintStore>((set, get) => ({
  sprints: [],
  
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

      set({ sprints: sprints || [] });
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

      const sprintId = data.id;

      // Insert sprint resources
      const sprintResources: SprintResourceData[] = sprint.resources.map(resource => ({
        sprint_id: sprintId,
        resource_id: resource.id,
        daily_capacities: convertDailyCapacitiesToJson(resource.dailyCapacities || [])
      }));

      const { error: resourcesError } = await supabase
        .from('sprint_resources')
        .insert(sprintResources);

      if (resourcesError) throw resourcesError;

      set(state => ({
        sprints: [...state.sprints, { ...data, sprint_resources: sprintResources }]
      }));

      toast.success("Sprint créé avec succès!");
    } catch (error) {
      console.error('Error adding sprint:', error);
      toast.error("Erreur lors de la création du sprint");
    }
  },

  updateSprint: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('sprints')
        .update({
          start_date: updates.startDate,
          end_date: updates.endDate,
          duration: updates.duration,
          story_points_committed: updates.storyPointsCommitted,
          theoretical_capacity: updates.theoreticalCapacity,
          objective: updates.objective,
          objective_achieved: updates.objectiveAchieved
        })
        .eq('id', id);

      if (error) throw error;

      // Update sprint resources
      for (const resource of updates.resources) {
        const { error: resourceError } = await supabase
          .from('sprint_resources')
          .upsert({
            sprint_id: id,
            resource_id: resource.id,
            daily_capacities: convertDailyCapacitiesToJson(resource.dailyCapacities || [])
          });

        if (resourceError) throw resourceError;
      }

      set(state => ({
        sprints: state.sprints.map(sprint =>
          sprint.id === id ? { ...sprint, ...updates } : sprint
        )
      }));
    } catch (error) {
      console.error('Error updating sprint:', error);
      toast.error("Erreur lors de la mise à jour du sprint");
    }
  },

  completeSprint: async (id, storyPoints) => {
    try {
      const sprint = get().sprints.find(s => s.id === id);
      if (!sprint) throw new Error('Sprint not found');

      const velocityAchieved = storyPoints / sprint.duration;
      const isSuccessful = calculateSprintSuccess(storyPoints, sprint.story_points_committed);

      const { error } = await supabase
        .from('sprints')
        .update({
          story_points_completed: storyPoints,
          velocity_achieved: velocityAchieved,
          is_successful: isSuccessful,
          commitment_respected: (storyPoints / sprint.story_points_committed) * 100
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        sprints: state.sprints.map(s =>
          s.id === id
            ? {
                ...s,
                storyPointsCompleted: storyPoints,
                velocityAchieved,
                isSuccessful,
                commitmentRespected: (storyPoints / s.storyPointsCommitted) * 100
              }
            : s
        )
      }));
    } catch (error) {
      console.error('Error completing sprint:', error);
      toast.error("Erreur lors de la complétion du sprint");
    }
  },

  getActiveTeamSprints: () => {
    const { activeTeam } = useScrumTeamStore.getState();
    return get().sprints.filter(sprint => sprint.team_id === activeTeam?.id);
  },

  calculateTheoreticalCapacity: (resources, duration) => {
    return resources.reduce((total, resource) => {
      const presenceDays = resource.dailyCapacities?.reduce((sum, dc) => sum + dc.capacity, 0) || 0;
      return total + (presenceDays * resource.capacityPerDay);
    }, 0);
  },

  getAverageVelocity: () => {
    const { activeTeam } = useScrumTeamStore.getState();
    const teamSprints = get().sprints.filter(s => 
      s.team_id === activeTeam?.id && 
      s.velocityAchieved !== undefined
    );
    
    if (teamSprints.length === 0) return 0;
    
    const totalVelocity = teamSprints.reduce((sum, sprint) => sum + (sprint.velocityAchieved || 0), 0);
    return totalVelocity / teamSprints.length;
  },

  canCreateNewSprint: () => {
    const { activeTeam } = useScrumTeamStore.getState();
    if (!activeTeam) return false;
    
    const teamSprints = get().sprints.filter(s => s.team_id === activeTeam.id);
    return teamSprints.length === 0 || teamSprints.every(s => s.storyPointsCompleted !== undefined);
  }
}));