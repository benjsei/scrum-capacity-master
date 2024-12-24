import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

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
    .map(({ name, percentage }) => ({ 
      name, 
      percentage,
      // Add a base value for the area
      areaBase: 100
    }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Respect des engagements</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            
            {/* Reference line at 100% */}
            <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" />
            
            {/* Area above 100% (green) */}
            <Area
              type="monotone"
              dataKey="percentage"
              fill="#22c55e"
              stroke="none"
              fillOpacity={0.6}
              baseValue={100}
              isAnimationActive={false}
            />
            
            {/* Area below 100% (red) */}
            <Area
              type="monotone"
              dataKey="percentage"
              fill="#ef4444"
              stroke="none"
              fillOpacity={0.6}
              baseValue={0}
              isAnimationActive={false}
            />
            
            {/* Main line */}
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke="#EA580C" 
              name="% Réalisation"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};