import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams } from 'react-router-dom';

export const TeamProgressChart = () => {
  const { teams } = useScrumTeamStore();
  const { getPracticesForTeam } = useAgilePracticesStore();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const { managerId } = useParams();

  const managerTeams = teams.filter(team => team.managerId === managerId);

  // Initialize with all manager's teams selected
  useEffect(() => {
    setSelectedTeams(managerTeams.map(t => t.id));
  }, [managerTeams]);

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const getTeamProgress = (teamId: string) => {
    const practices = getPracticesForTeam(teamId);
    if (practices.length === 0) return 0;
    return Math.round((practices.filter(p => p.isCompleted).length / practices.length) * 100);
  };

  const chartData = managerTeams
    .filter(team => selectedTeams.includes(team.id))
    .map(team => ({
      name: team.name,
      progress: getTeamProgress(team.id)
    }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Progression des pratiques par équipe</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        {managerTeams.map((team) => (
          <div key={team.id} className="flex items-center space-x-2">
            <Checkbox
              id={`team-${team.id}`}
              checked={selectedTeams.includes(team.id)}
              onCheckedChange={() => toggleTeam(team.id)}
            />
            <label
              htmlFor={`team-${team.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {team.name}
            </label>
          </div>
        ))}
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="progress" fill="#3b82f6" name="Progression (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};