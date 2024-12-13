import { FC } from 'react';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { TeamPractices } from '../types/agilePractice';

interface TeamProgressChartProps {
  teamId: string;
}

export const TeamProgressChart: FC<TeamProgressChartProps> = ({ teamId }) => {
  const { getPracticesForTeam } = useAgilePracticesStore();
  const practices: TeamPractices[] = getPracticesForTeam(teamId);

  // Logic to render the chart based on practices
  const completedCount = practices.filter(p => p.isCompleted).length;
  const totalCount = practices.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div>
      <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
      <span>{completedCount} of {totalCount} practices completed</span>
    </div>
  );
};
