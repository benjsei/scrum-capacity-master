import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Sprint } from "../types/sprint";

interface SprintStore {
  sprints: Sprint[];
  addSprint: (sprint: Sprint) => void;
  updateSprint: (sprintId: string, sprint: Partial<Sprint>) => void;
  deleteSprint: (sprintId: string) => void;
  loadSprints: () => Promise<void>;
  getActiveTeamSprints: () => Sprint[];
  getTeamSprints: (teamId: string) => Sprint[];
  canCreateNewSprint: () => boolean;
}

export const useSprintStore = create<SprintStore>()(
  persist(
    (set, get) => ({
      sprints: [],

      addSprint: (sprint) => {
        set((state) => ({
          sprints: [...state.sprints, sprint],
        }));
      },

      updateSprint: (sprintId, updatedSprint) => {
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === sprintId ? { ...sprint, ...updatedSprint } : sprint
          ),
        }));
      },

      deleteSprint: (sprintId) => {
        set((state) => ({
          sprints: state.sprints.filter((sprint) => sprint.id !== sprintId),
        }));
      },

      loadSprints: async () => {
        // In a real app, this would load from an API
        return Promise.resolve();
      },

      getActiveTeamSprints: () => {
        const activeTeam = localStorage.getItem('activeTeam');
        if (!activeTeam) return [];
        const teamId = JSON.parse(activeTeam).id;
        return get().sprints.filter(sprint => sprint.teamId === teamId);
      },

      getTeamSprints: (teamId: string) => {
        return get().sprints.filter(sprint => sprint.teamId === teamId);
      },

      canCreateNewSprint: () => {
        const activeTeam = localStorage.getItem('activeTeam');
        if (!activeTeam) return false;
        
        const teamId = JSON.parse(activeTeam).id;
        const teamSprints = get().sprints.filter(sprint => sprint.teamId === teamId);
        
        if (teamSprints.length === 0) return true;
        
        const lastSprint = teamSprints.reduce((latest, current) => {
          const latestDate = new Date(latest.endDate);
          const currentDate = new Date(current.endDate);
          return latestDate > currentDate ? latest : current;
        });
        
        return new Date(lastSprint.endDate) < new Date();
      },
    }),
    {
      name: 'sprint-storage',
    }
  )
);