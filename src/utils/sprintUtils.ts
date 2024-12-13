import { ResourceDailyCapacity } from "../types/sprint";
import { Json } from "@/integrations/supabase/types";

export const mapDailyCapacitiesToJson = (dailyCapacities: ResourceDailyCapacity[]): Json => {
  return dailyCapacities.map(capacity => ({
    date: capacity.date,
    capacity: capacity.capacity
  }));
};