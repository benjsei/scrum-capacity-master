import { Resource } from "@/types/sprint";
import { initializeDailyCapacities } from "./sprintUtils";

export const initializeSprintResources = (
  teamResources: Resource[],
  startDate: string,
  duration: number,
  forceRecalculation = false
): Resource[] => {
  return teamResources.map(resource => 
    initializeDailyCapacities(resource, startDate, duration, forceRecalculation)
  );
};