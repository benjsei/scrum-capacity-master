import { create } from 'zustand';
import { ScrumTeam } from '../types/scrumTeam';

interface ScrumTeamStore {
  teams: ScrumTeam[];
  activeTeam: ScrumTeam | null;
  setActiveTeam: (team: ScrumTeam | null) => void;
  addTeam: (team: ScrumTeam) => void;
  deleteTeam: (teamId: string) => void;
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
}));