import { ResourceDailyCapacity } from "@/types/sprint";
import { Json } from "@/integrations/supabase/types";

export const convertDailyCapacitiesToJson = (dailyCapacities: ResourceDailyCapacity[]): Json => {
  return dailyCapacities.map(dc => ({
    date: dc.date,
    capacity: dc.capacity
  }));
};

export const calculateSprintSuccess = (completed: number, committed: number): boolean => {
  return (completed / committed) >= 0.8;
};