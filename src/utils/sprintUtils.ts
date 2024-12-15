import { Resource } from "@/types/sprint";

export const initializeDailyCapacities = (
  resource: Resource, 
  startDate: string, 
  duration: number,
  forceRecalculation = false
): Resource => {
  // Si la ressource a déjà des capacités et qu'on ne force pas la réinitialisation
  if (resource.dailyCapacities && resource.dailyCapacities.length > 0 && !forceRecalculation) {
    return resource;
  }

  const start = new Date(startDate);
  const dailyCapacities = [];
  
  for (let i = 0; i < duration; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    dailyCapacities.push({
      date: dateStr,
      capacity: isWeekend ? 0 : resource.capacityPerDay
    });
  }

  return {
    ...resource,
    dailyCapacities
  };
};