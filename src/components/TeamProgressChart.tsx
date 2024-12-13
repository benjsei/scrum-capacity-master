import { FC } from 'react';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { AgilePractice } from '../types/agilePractice';
import { Progress } from "@/components/ui/progress";

interface TeamProgressChartProps {
  teamId: string;
}

export const TeamProgressChart: FC<TeamProgressChartProps> = ({ teamId }) => {
  const { getPracticesForTeam } = useAgilePracticesStore();
  const practices: AgilePractice[] = getPracticesForTeam(teamId);

  const completedCount = practices.filter(p => p.isCompleted).length;
  const totalCount = practices.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-2">
      <Progress value={progressPercentage} className="w-full" />
      <span className="text-sm text-muted-foreground">
        {completedCount} of {totalCount} practices completed
      </span>
    </div>
  );
};