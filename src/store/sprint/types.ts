import { Json } from "@/integrations/supabase/types";
import { Resource, Sprint } from "@/types/sprint";

export interface SprintStore {
  sprints: Sprint[];
  loadSprints: () => Promise<void>;
  addSprint: (sprint: Sprint) => Promise<void>;
  updateSprint: (id: string, updates: Partial<Sprint>) => Promise<void>;
  completeSprint: (id: string, storyPoints: number) => Promise<void>;
  getActiveTeamSprints: () => Sprint[];
  calculateTheoreticalCapacity: (resources: Resource[], duration: number) => number;
  getAverageVelocity: () => number;
  canCreateNewSprint: () => boolean;
}

export interface SprintResourceData {
  sprint_id: string;
  resource_id: string;
  daily_capacities: Json;
}