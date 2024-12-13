import { FC } from 'react';
import { useAgilePracticesStore } from '../store/agilePracticesStore';

interface TeamProgressChartProps {
  teamId: string;
}

export const TeamProgressChart: FC<TeamProgressChartProps> = ({ teamId }) => {
  const { getPracticesForTeam } = useAgilePracticesStore();
  const practices = getPracticesForTeam(teamId);
  
  if (!practices) return null;
  
  const completedPractices = practices.filter(p => p.isCompleted).length;
  const progressPercentage = practices.length > 0 ? (completedPractices / practices.length) * 100 : 0;

  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
            Progression
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-primary-600">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
        <div
          style={{ width: `${progressPercentage}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
        />
      </div>
    </div>
  );
};