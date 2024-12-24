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
            
            {/* Reference line at 100% */}
            <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" />
            
            {/* Area between curve and reference line */}
            <Area
              type="monotone"
              dataKey="percentage"
              baseValue={100}
              fill={`url(#colorGradient)`}
              stroke="none"
              fillOpacity={0.6}
            />
            
            {/* Define gradient with more abrupt transition around 80% */}
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
            
            {/* Main line */}
            <Line 
              type="monotone" 
              dataKey="percentage" 
              stroke="#EA580C" 
              strokeWidth={2}
              isAnimationActive={false}
              hide={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};