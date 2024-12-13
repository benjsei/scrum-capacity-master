import { Json } from "@/integrations/supabase/types";
import { Resource, ResourceDailyCapacity } from "@/types/sprint";

export interface SprintStore {
  sprints: any[];
  loadSprints: () => Promise<void>;
  addSprint: (sprint: any) => void;
  updateSprint: (id: string, updates: any) => void;
  completeSprint: (id: string, storyPoints: number) => void;
  getActiveTeamSprints: () => any[];
  calculateTheoreticalCapacity: (resources: Resource[], duration: number) => number;
  getAverageVelocity: () => number;
  canCreateNewSprint: () => boolean;
}

export interface SprintResourceData {
  sprint_id: string;
  resource_id: string;
  daily_capacities: Json;
}