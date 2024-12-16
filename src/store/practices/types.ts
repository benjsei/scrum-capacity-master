import { AgilePractice, TeamPractices } from '@/types/agilePractice';

export interface AgilePracticesStore {
  teamPractices: TeamPractices[];
  initializePractices: (teamId: string) => Promise<void>;
  togglePracticeCompletion: (teamId: string, practiceId: string) => void;
  updatePracticeUrl: (teamId: string, practiceId: string, url: string) => void;
  getPracticesForTeam: (teamId: string) => AgilePractice[];
}