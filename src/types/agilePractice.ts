export interface AgilePractice {
  id: string;
  day: string;
  who: string;
  type: string;
  action: string;
  subActions: string;
  format: string;
  duration: string;
  isCompleted: boolean;
  completedAt?: string;
  url?: string;
}

export interface TeamPractices {
  teamId: string;
  practices: AgilePractice[];
}