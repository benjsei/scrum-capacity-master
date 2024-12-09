import { create } from 'zustand';
import { Sprint, Resource } from '../types/sprint';

interface SprintStore {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (sprintId: string, sprint: Partial<Sprint>) => void;
  deleteSprint: (sprintId: string) => void;
  completeSprint: (sprintId: string, storyPointsCompleted: number) => void;
  calculateTheoreticalCapacity: (resources: Resource[], duration: number) => number;
  getAverageVelocity: () => number;
}

export const useSprintStore = create<SprintStore>((set, get) => ({
  sprints: [],
  activeSprint: null,

  addSprint: (sprint) => {
    set((state) => ({
      sprints: [...state.sprints, sprint],
      activeSprint: sprint,
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
    const { sprints } = get();
    const completedSprints = sprints.filter(s => s.storyPointsCompleted !== undefined);
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
}));