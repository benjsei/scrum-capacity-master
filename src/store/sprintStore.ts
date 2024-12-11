import { create } from 'zustand';
import { Sprint, Resource } from '../types/sprint';
import { useScrumTeamStore } from './scrumTeamStore';
import { toast } from "sonner";

interface SprintStore {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  setSprints: (sprints: Sprint[]) => void;
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
  setSprints: (sprints) => set({ sprints }),

  addSprint: (sprint) => {
    const activeTeam = useScrumTeamStore.getState().activeTeam;
    if (!activeTeam) {
      toast.error("No active team selected");
      return;
    }

    const teamSprints = get().getActiveTeamSprints();
    const hasActiveSprint = teamSprints.some(s => s.isSuccessful === undefined);
    
    if (hasActiveSprint) {
      toast.error("Un sprint est déjà en cours pour cette équipe");
      return;
    }

    // Vérification des chevauchements de dates
    const hasOverlap = teamSprints.some(s => {
      const newStart = new Date(sprint.startDate);
      const newEnd = new Date(sprint.endDate);
      const sprintStart = new Date(s.startDate);
      const sprintEnd = new Date(s.endDate);
      
      return (
        (newStart >= sprintStart && newStart <= sprintEnd) ||
        (newEnd >= sprintStart && newEnd <= sprintEnd) ||
        (newStart <= sprintStart && newEnd >= sprintEnd)
      );
    });

    if (hasOverlap) {
      toast.error("Les dates du sprint se chevauchent avec un sprint existant");
      return;
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
    const activeTeam = useScrumTeamStore.getState().activeTeam;
    if (!activeTeam) return false;
    
    const teamSprints = get().getActiveTeamSprints();
    return !teamSprints.some(s => s.isSuccessful === undefined);
  },
}));
