import { create } from 'zustand';
import { ScrumTeam } from '../types/scrumTeam';
import { Resource } from '../types/sprint';

interface ScrumTeamStore {
  teams: ScrumTeam[];
  activeTeam: ScrumTeam | null;
  setActiveTeam: (team: ScrumTeam | null) => void;
  addTeam: (team: ScrumTeam) => void;
  deleteTeam: (teamId: string) => void;
  updateTeamName: (teamId: string, newName: string) => void;
  addResource: (teamId: string, resource: Resource) => void;
  updateResource: (teamId: string, resourceId: string, updates: Partial<Resource>) => void;
  deleteResource: (teamId: string, resourceId: string) => void;
}

export const useScrumTeamStore = create<ScrumTeamStore>((set) => ({
  teams: [],
  activeTeam: null,
  setActiveTeam: (team) => set({ activeTeam: team }),
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  deleteTeam: (teamId) => set((state) => ({
    teams: state.teams.filter((team) => team.id !== teamId),
    activeTeam: state.activeTeam?.id === teamId ? null : state.activeTeam,
  })),
  updateTeamName: (teamId, newName) => set((state) => ({
    teams: state.teams.map((team) =>
      team.id === teamId ? { ...team, name: newName } : team
    ),
    activeTeam: state.activeTeam?.id === teamId 
      ? { ...state.activeTeam, name: newName }
      : state.activeTeam,
  })),
  addResource: (teamId, resource) => set((state) => ({
    teams: state.teams.map((team) =>
      team.id === teamId
        ? { ...team, resources: [...team.resources, resource] }
        : team
    ),
  })),
  updateResource: (teamId, resourceId, updates) => set((state) => ({
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
  })),
  deleteResource: (teamId, resourceId) => set((state) => ({
    teams: state.teams.map((team) =>
      team.id === teamId
        ? {
            ...team,
            resources: team.resources.filter((r) => r.id !== resourceId),
          }
        : team
    ),
  })),
}));