import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useManagerStore } from '../store/managerStore';
import { useSprintStore } from '../store/sprintStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateVelocity, calculateTotalCapacity } from '@/utils/sprintCalculations';

export const ManagerVelocityChart = () => {
  const { managers } = useManagerStore();
  const { sprints } = useSprintStore();
  const { teams } = useScrumTeamStore();
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

  const allDates = [...new Set(sprints
    .filter(sprint => sprint.storyPointsCompleted !== undefined && sprint.storyPointsCompleted !== null)
    .map(sprint => sprint.startDate))]
    .sort();
  
  const data = allDates
    .map(date => {
      const dataPoint: any = { 
        date: new Date(date).toLocaleDateString(),
        originalDate: new Date(date),
      };
      
      managers.forEach(manager => {
        const managerTeams = teams.filter(team => team.managerId === manager.id);
        const teamSprints = sprints.filter(sprint => 
          managerTeams.some(team => team.id === sprint.teamId) &&
          sprint.startDate === date &&
          sprint.storyPointsCompleted !== undefined &&
          sprint.storyPointsCompleted !== null
        );
        
        if (teamSprints.length > 0) {
          const totalVelocity = teamSprints.reduce((sum, sprint) => {
            const totalPersonDays = calculateTotalCapacity(sprint);
            return sum + calculateVelocity(sprint.storyPointsCompleted!, totalPersonDays);
          }, 0);
          dataPoint[manager.id] = totalVelocity / teamSprints.length;
        }
      });
      
      return dataPoint;
    })
    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime())
    .map(({ date, originalDate, ...rest }) => ({ date, ...rest }));

  const colors = [
    '#EA580C', '#2563EB', '#16A34A', '#9333EA', '#DB2777'
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Vélocité moyenne par manager (SP/j/h)</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        {managers.map((manager, index) => (
          <div key={manager.id} className="flex items-center space-x-2">
            <Checkbox
              id={`manager-velocity-${manager.id}`}
              checked={selectedManagers.includes(manager.id)}
              onCheckedChange={() => toggleManager(manager.id)}
            />
            <label
              htmlFor={`manager-velocity-${manager.id}`}
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {managers.map((manager, index) => (
              selectedManagers.includes(manager.id) && (
                <Line
                  key={manager.id}
                  type="monotone"
                  dataKey={manager.id}
                  name={manager.name}
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