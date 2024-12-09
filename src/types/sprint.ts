export interface ResourceDailyCapacity {
  date: string;
  capacity: number;
}

export interface Resource {
  id: string;
  name: string;
  capacityPerDay: number;
  dailyCapacities?: ResourceDailyCapacity[];
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