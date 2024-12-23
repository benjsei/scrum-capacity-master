import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const VelocityChart = () => {
  const { getActiveTeamSprints } = useSprintStore();
  const sprints = getActiveTeamSprints();

  const data = sprints
    .filter(sprint => 
      sprint.isSuccessful && 
      sprint.storyPointsCompleted !== undefined && 
      sprint.velocityAchieved !== undefined
    )
    .map((sprint) => ({
      name: new Date(sprint.startDate).toLocaleDateString(),
      velocity: sprint.velocityAchieved || 0,
      date: new Date(sprint.startDate), // Used for sorting
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, velocity }) => ({ name, velocity })); // Remove date after sorting

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Velocity Trend (SP/JH)</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="velocity" 
              stroke="#2563EB" 
              name="Vélocité"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};