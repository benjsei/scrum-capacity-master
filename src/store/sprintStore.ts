import { create } from 'zustand';
import { Sprint, Resource } from '../types/sprint';
import { useScrumTeamStore } from './scrumTeamStore';

interface SprintStore {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (sprintId: string, sprint: Partial<Sprint>) => void;
  deleteSprint: (sprintId: string) => void;
  completeSprint: (sprintId: string, storyPointsCompleted: number) => void;
  calculateTheoreticalCapacity: (resources: Resource[], duration: number) => number;
  getAverageVelocity: () => number;
  getActiveTeamSprints: () => Sprint[];
  canCreateNewSprint: () => boolean;
}

export const useSprintStore = create<SprintStore>((set, get) => ({
  sprints: [],
  activeSprint: null,

  addSprint: (sprint) => {
    const activeTeam = useScrumTeamStore.getState().activeTeam;
    if (!activeTeam) return;

    const teamSprints = get().getActiveTeamSprints();
    const hasActiveSprint = teamSprints.some(s => s.isSuccessful === undefined);
    
    if (hasActiveSprint) {
      toast.error("Cannot create a new sprint while another is active");
      return;
    }

    const lastSprint = teamSprints[teamSprints.length - 1];
    if (lastSprint) {
      const nextStartDate = new Date(lastSprint.endDate);
      nextStartDate.setDate(nextStartDate.getDate() + 1);
      const expectedStartDate = nextStartDate.toISOString().split('T')[0];
      
      if (sprint.startDate !== expectedStartDate) {
        toast.error("Sprint must start the day after the previous sprint ends");
        return;
      }
    }

    set((state) => ({
      sprints: [...state.sprints, { ...sprint, teamId: activeTeam.id }],
      activeSprint: { ...sprint, teamId: activeTeam.id },
    }));
  },

  updateSprint: (sprintId, updatedFields) => {
    set((state) => ({
      sprints: state.sprints.map((sprint) =>
        sprint.id === sprintId ? { ...sprint, ...updatedFields } : sprint
      ),
    }));
  },

  deleteSprint: (sprintId) => {
    set((state) => ({
      sprints: state.sprints.filter((sprint) => sprint.id !== sprintId),
      activeSprint: state.activeSprint?.id === sprintId ? null : state.activeSprint,
    }));
  },

  completeSprint: (sprintId, storyPointsCompleted) => {
    set((state) => ({
      sprints: state.sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              storyPointsCompleted,
              isSuccessful: storyPointsCompleted >= sprint.storyPointsCommitted,
              velocityAchieved: storyPointsCompleted / sprint.duration,
              commitmentRespected: (storyPointsCompleted / sprint.storyPointsCommitted) * 100,
            }
          : sprint
      ),
      activeSprint: null,
    }));
  },

  getAverageVelocity: () => {
    const teamSprints = get().getActiveTeamSprints();
    const completedSprints = teamSprints.filter(s => s.storyPointsCompleted !== undefined);
    const lastThreeSprints = completedSprints.slice(-3);
    
    if (lastThreeSprints.length === 0) return 1;
    
    const totalVelocity = lastThreeSprints.reduce((acc, sprint) => 
      acc + (sprint.velocityAchieved || 0), 0);
    
    return totalVelocity / lastThreeSprints.length;
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

  getActiveTeamSprints: () => {
    const activeTeam = useScrumTeamStore.getState().activeTeam;
    if (!activeTeam) return [];
    return get().sprints.filter(sprint => sprint.teamId === activeTeam.id);
  },

  canCreateNewSprint: () => {
    const teamSprints = get().getActiveTeamSprints();
    return !teamSprints.some(sprint => sprint.isSuccessful === undefined);
  },
}));