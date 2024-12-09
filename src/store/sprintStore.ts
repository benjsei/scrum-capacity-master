import { create } from 'zustand';
import { Sprint, Resource } from '../types/sprint';

interface SprintStore {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (sprintId: string, sprint: Partial<Sprint>) => void;
  deleteSprint: (sprintId: string) => void;
  calculateTheoreticalCapacity: (resources: Resource[], duration: number) => number;
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

  calculateTheoreticalCapacity: (resources: Resource[], duration: number) => {
    const { sprints } = get();
    const lastThreeSprints = sprints.slice(-3);
    
    let averageVelocity;
    if (lastThreeSprints.length >= 3) {
      averageVelocity = lastThreeSprints.reduce((acc, sprint) => 
        acc + (sprint.velocityAchieved || 0), 0) / lastThreeSprints.length;
    } else if (lastThreeSprints.length > 0) {
      averageVelocity = lastThreeSprints.reduce((acc, sprint) => 
        acc + (sprint.velocityAchieved || 0), 0) / lastThreeSprints.length;
    } else {
      averageVelocity = 1;
    }

    const totalResourceCapacity = resources.reduce((acc, resource) => {
      if (resource.dailyCapacities && resource.dailyCapacities.length > 0) {
        return acc + (resource.dailyCapacities.reduce((sum, dc) => sum + dc.capacity, 0) / resource.dailyCapacities.length);
      }
      return acc + resource.capacityPerDay;
    }, 0);

    return averageVelocity * totalResourceCapacity * duration;
  },
}));