import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const CommitmentChart = () => {
  const { getActiveTeamSprints } = useSprintStore();
  const sprints = getActiveTeamSprints();

  const data = sprints
    .filter(sprint => sprint.isSuccessful !== undefined)
    .map((sprint) => ({
      name: new Date(sprint.startDate).toLocaleDateString(),
      committed: sprint.storyPointsCommitted,
      completed: sprint.storyPointsCompleted || 0,
      theoretical: sprint.theoreticalCapacity,
    }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Respect des engagements</h3>
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
              dataKey="committed" 
              stroke="#1E40AF" 
              name="SP engagés"
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#15803D" 
              name="SP réalisés"
            />
            <Line 
              type="monotone" 
              dataKey="theoretical" 
              stroke="#60A5FA" 
              name="Capacité théorique"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};