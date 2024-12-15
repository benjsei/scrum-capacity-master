import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSprintStore } from '../store/sprintStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useManagerStore } from '../store/managerStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ManagerCommitmentChart = () => {
  const { managers } = useManagerStore();
  const { teams } = useScrumTeamStore();
  const { sprints } = useSprintStore();
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);

  useEffect(() => {
    setSelectedManagers(managers.map(m => m.id));
  }, [managers]);

  const toggleManager = (managerId: string) => {
    setSelectedManagers(prev =>
      prev.includes(managerId)
        ? prev.filter(id => id !== managerId)
        : [...prev, managerId]
    );
  };

  const getManagerCommitmentData = (managerId: string) => {
    const managerTeams = teams.filter(team => team.managerId === managerId);
    const allTeamSprints = sprints.filter(sprint => 
      managerTeams.some(team => team.id === sprint.teamId) && 
      sprint.storyPointsCompleted !== undefined
    );

    // Group sprints by month
    const sprintsByMonth = allTeamSprints.reduce((acc, sprint) => {
      const monthKey = new Date(sprint.startDate).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          totalPercentage: 0,
          count: 0
        };
      }
      
      const percentage = sprint.storyPointsCompleted 
        ? (sprint.storyPointsCompleted / sprint.storyPointsCommitted) * 100
        : 0;
      
      acc[monthKey].totalPercentage += percentage;
      acc[monthKey].count += 1;
      
      return acc;
    }, {} as Record<string, { totalPercentage: number, count: number }>);

    // Calculate average for each month
    return Object.entries(sprintsByMonth)
      .map(([month, data]) => ({
        name: month,
        percentage: Math.round(data.totalPercentage / data.count),
        date: new Date(month),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const colors = ['#EA580C', '#2563EB', '#16A34A', '#9333EA', '#DB2777'];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Respect des engagements par manager</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        {managers.map((manager, index) => (
          <div key={manager.id} className="flex items-center space-x-2">
            <Checkbox
              id={`manager-${manager.id}`}
              checked={selectedManagers.includes(manager.id)}
              onCheckedChange={() => toggleManager(manager.id)}
            />
            <label
              htmlFor={`manager-${manager.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              style={{ color: colors[index % colors.length] }}
            >
              {manager.name}
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
            {selectedManagers.map((managerId, index) => {
              const managerData = getManagerCommitmentData(managerId);
              const manager = managers.find(m => m.id === managerId);
              return (
                <Line
                  key={managerId}
                  data={managerData}
                  type="monotone"
                  dataKey="percentage"
                  stroke={colors[index % colors.length]}
                  name={manager?.name || ''}
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