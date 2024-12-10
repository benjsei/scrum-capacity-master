export interface ScrumTeam {
  id: string;
  name: string;
  createdAt: string;
  resources: Resource[];
}

export interface Resource {
  id: string;
  name: string;
  capacityPerDay: number;
  dailyCapacities?: ResourceDailyCapacity[];
}

export interface ResourceDailyCapacity {
  date: string;
  capacity: number;
}