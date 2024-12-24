import { useSprintStore } from '../store/sprintStore';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

interface MiniCommitmentChartProps {
  teamId: string;
  height?: number;
}

export const MiniCommitmentChart = ({ teamId, height = 100 }: MiniCommitmentChartProps) => {
  const { getTeamSprints } = useSprintStore();
  const sprints = getTeamSprints(teamId);

  const data = sprints
    .filter(sprint => sprint.storyPointsCompleted !== undefined && sprint.storyPointsCompleted !== null)
    .map((sprint) => ({
      name: new Date(sprint.startDate).toLocaleDateString(),
      engagement: sprint.storyPointsCompleted 
        ? Math.round((sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100)
        : 0,
      date: new Date(sprint.startDate),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, engagement }) => ({ 
      name, 
      engagement,
      areaBase: 100
    }));

  if (data.length === 0) {
    return null;
  }

  return (
    <div style={{ height: height, width: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={false} />
          <YAxis hide />
          <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="engagement"
            baseValue={100}
            fill={`url(#colorGradient)`}
            stroke="none"
            fillOpacity={0.6}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
              <stop offset="35%" stopColor="#22c55e" stopOpacity={0.9} />
              <stop offset="38%" stopColor="#F97316" stopOpacity={0.8} />
              <stop offset="42%" stopColor="#F97316" stopOpacity={0.8} />
              <stop offset="45%" stopColor="#ef4444" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <Line 
            type="monotone" 
            dataKey="engagement" 
            stroke="#EA580C" 
            strokeWidth={2}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};