import { ResourceDailyCapacity } from "@/types/sprint";
import { Json } from "@/integrations/supabase/types";

export const convertDailyCapacitiesToJson = (dailyCapacities: ResourceDailyCapacity[]): Json => {
  return dailyCapacities.map(dc => ({
    date: dc.date,
    capacity: dc.capacity
  }));
};

export const calculateSprintSuccess = (storyPointsCompleted: number, storyPointsCommitted: number): boolean => {
  return (storyPointsCompleted / storyPointsCommitted) >= 0.8;
};