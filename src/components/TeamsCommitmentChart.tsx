import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSprintStore } from '../store/sprintStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useParams } from 'react-router-dom';

export const TeamsCommitmentChart = () => {
  const { teams } = useScrumTeamStore();
  const { sprints } = useSprintStore();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const { managerId } = useParams();

  const managerTeams = teams.filter(team => team.managerId === managerId);

  useEffect(() => {
    if (managerTeams.length > 0 && selectedTeams.length === 0) {
      setSelectedTeams(managerTeams.map(t => t.id));
    }
  }, [managerTeams, selectedTeams.length]);

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const getTeamCommitmentData = (teamId: string) => {
    return sprints
      .filter(sprint => 
        sprint.teamId === teamId && 
        sprint.storyPointsCompleted !== undefined && 
        sprint.isSuccessful !== undefined
      )
      .map((sprint) => ({
        name: new Date(sprint.startDate).toLocaleDateString(),
        percentage: sprint.storyPointsCompleted 
          ? Math.round((sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100)
          : 0,
        date: new Date(sprint.startDate),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const colors = ['#EA580C', '#2563EB', '#16A34A', '#9333EA', '#DB2777'];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Respect des engagements par équipe</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        {managerTeams.map((team, index) => (
          <div key={team.id} className="flex items-center space-x-2">
            <Checkbox
              id={`commitment-team-${team.id}`}
              checked={selectedTeams.includes(team.id)}
              onCheckedChange={() => toggleTeam(team.id)}
            />
            <label
              htmlFor={`commitment-team-${team.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              style={{ color: colors[index % colors.length] }}
            >
              {team.name}
            </label>
          </div>
        ))}
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              allowDuplicatedCategory={false}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <ReferenceLine 
              y={100} 
              stroke="#666" 
              strokeDasharray="5 5"
              label={{ 
                value: "100%", 
                position: "right",
                fill: "#666",
                fontSize: 12
              }}
            />
            {selectedTeams.map((teamId, index) => {
              const teamData = getTeamCommitmentData(teamId);
              const team = teams.find(t => t.id === teamId);
              return (
                <Line
                  key={teamId}
                  data={teamData}
                  type="monotone"
                  dataKey="percentage"
                  stroke={colors[index % colors.length]}
                  name={team?.name || ''}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};