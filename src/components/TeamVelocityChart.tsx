import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSprintStore } from '../store/sprintStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';

export const TeamVelocityChart = () => {
  const { sprints } = useSprintStore();
  const { teams } = useScrumTeamStore();
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

  const allDates = [...new Set(sprints.map(sprint => sprint.startDate))].sort();
  
  const data = allDates
    .map(date => {
      const dataPoint: any = { 
        date: new Date(date).toLocaleDateString(),
        originalDate: new Date(date),
      };
      managerTeams.forEach(team => {
        const teamSprint = sprints.find(sprint => 
          sprint.teamId === team.id && 
          sprint.startDate === date &&
          sprint.velocityAchieved !== undefined
        );
        if (teamSprint) {
          dataPoint[team.id] = teamSprint.velocityAchieved;
        }
      });
      return dataPoint;
    })
    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
    .map(({ date, originalDate, ...rest }) => ({ date, ...rest }));

  const colors = [
    '#1E40AF', '#15803D', '#B91C1C', '#6B21A8', '#C2410C',
    '#0369A1', '#047857', '#BE123C', '#7E22CE', '#EA580C'
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Vélocité par équipe (SP/JH)</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        {managerTeams.map((team, index) => (
          <div key={team.id} className="flex items-center space-x-2">
            <Checkbox
              id={`velocity-team-${team.id}`}
              checked={selectedTeams.includes(team.id)}
              onCheckedChange={() => toggleTeam(team.id)}
            />
            <label
              htmlFor={`velocity-team-${team.id}`}
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {managerTeams.map((team, index) => (
              selectedTeams.includes(team.id) && (
                <Line
                  key={team.id}
                  type="monotone"
                  dataKey={team.id}
                  name={team.name}
                  stroke={colors[index % colors.length]}
                  dot={{ r: 4 }}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};