import { Json } from "@/integrations/supabase/types";

export interface ResourceDailyCapacity {
  date: string;
  capacity: number;
}

export interface Resource {
  id: string;
  name: string;
  capacityPerDay: number;
  teamId?: string;
  dailyCapacities?: ResourceDailyCapacity[];
}

export interface Sprint {
  id: string;
  teamId: string;
  startDate: string;
  endDate: string;
  duration: number;
  resources: Resource[];
  storyPointsCommitted: number;
  storyPointsCompleted?: number;
  cardsCompleted?: number;
  isSuccessful?: boolean;
  theoreticalCapacity: number;
  velocityAchieved?: number;
  commitmentRespected?: number;
  objective?: string;
  objectiveAchieved?: boolean;
}

export interface SprintResourceData {
  sprint_id: string;
  resource_id: string;
  daily_capacities: Json;
}