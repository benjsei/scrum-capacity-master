export interface Resource {
  id: string;
  name: string;
  capacityPerDay: number;
}

export interface Sprint {
  id: string;
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
}