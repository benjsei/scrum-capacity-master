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
      // Add these fields for the areas
      aboveArea: percentage >= 100 ? percentage : null,
      belowArea: percentage < 100 ? percentage : null
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
            
            {/* Area below 100% */}
            <Area
              type="monotone"
              dataKey="belowArea"
              fill="#ef4444"
              fillOpacity={0.3}
              stroke="none"
              isAnimationActive={false}
            />
            
            {/* Area above 100% */}
            <Area
              type="monotone"
              dataKey="aboveArea"
              fill="#22c55e"
              fillOpacity={0.3}
              stroke="none"
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