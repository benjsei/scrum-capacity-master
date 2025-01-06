import { Sprint } from "@/types/sprint";

export const calculateTotalCapacity = (sprint: Sprint) => {
  if (!sprint.resources || !Array.isArray(sprint.resources)) return 0;
  
  return sprint.resources.reduce((total, resource) => {
    if (!resource.dailyCapacities) return total;
    const resourceTotal = resource.dailyCapacities.reduce((sum, dc) => {
      return sum + (dc?.capacity || 0);
    }, 0);
    return total + (resourceTotal || 0);
  }, 0);
};

export const calculateVelocity = (storyPoints: number, totalPersonDays: number) => {
  if (totalPersonDays === 0) return 0;
  return storyPoints / totalPersonDays;
};

export const getSprintStatus = (sprint: Sprint) => {
  if (sprint.storyPointsCompleted === undefined || sprint.storyPointsCompleted === null) {
    return 'En cours';
  }
  if (sprint.isSuccessful === true) {
    return 'Succès';
  }
  if (sprint.isSuccessful === false) {
    return 'Échec';
  }
  const commitmentPercentage = (sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100;
  return commitmentPercentage >= 80 ? 'Succès' : 'Échec';
};