import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

export const CommitmentChart = () => {
  const { getActiveTeamSprints } = useSprintStore();
  const sprints = getActiveTeamSprints();

  const data = sprints
    .filter(sprint => sprint.storyPointsCompleted !== undefined && sprint.storyPointsCompleted !== null)
    .map((sprint) => ({
      name: new Date(sprint.startDate).toLocaleDateString(),
      percentage: sprint.storyPointsCompleted 
        ? Math.round((sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100)
        : 0,
      date: new Date(sprint.startDate), // Used for sorting
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, percentage }) => ({ name, percentage }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Respect des engagements</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <clipPath id="clipAbove">
                <rect x="0" y="0" width="100%" height="100" />
              </clipPath>
              <clipPath id="clipBelow">
                <rect x="0" y="100" width="100%" height="100%" />
              </clipPath>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 'dataMax']} />
            <Tooltip />
            <Legend />
            
            {/* Reference line at 100% */}
            <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" />
            
            {/* Area below 100% (red) */}
            <Area
              type="monotone"
              dataKey="percentage"
              fill="#ef4444"
              stroke="none"
              clipPath="url(#clipBelow)"
            />
            
            {/* Area above 100% (green) */}
            <Area
              type="monotone"
              dataKey="percentage"
              fill="#22c55e"
              stroke="none"
              clipPath="url(#clipAbove)"
            />
            
            {/* Main line */}
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke="#EA580C" 
              name="% Réalisation"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};