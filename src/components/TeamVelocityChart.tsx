import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const TeamVelocityChart = () => {
  const { sprints } = useSprintStore();
  const { teams } = useScrumTeamStore();

  const data = teams.map(team => {
    const teamSprints = sprints.filter(sprint => sprint.teamId === team.id && sprint.isSuccessful !== undefined);
    const averageVelocity = teamSprints.reduce((acc, sprint) => 
      acc + (sprint.velocityAchieved || 0), 0) / (teamSprints.length || 1);
    
    return {
      name: team.name,
      velocity: averageVelocity,
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Vélocité par équipe (SP/JH)</h3>
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
              stroke="#1E40AF" 
              name="Vélocité moyenne"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};