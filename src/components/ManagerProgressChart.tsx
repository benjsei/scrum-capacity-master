import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useManagerStore } from '../store/managerStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ManagerProgressChart = () => {
  const { managers } = useManagerStore();
  const { teams } = useScrumTeamStore();
  const { getPracticesForTeam } = useAgilePracticesStore();
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

  const getManagerProgress = (managerId: string) => {
    const managerTeams = teams.filter(team => team.managerId === managerId);
    if (managerTeams.length === 0) return 0;
    
    let totalProgress = 0;
    managerTeams.forEach(team => {
      const practices = getPracticesForTeam(team.id);
      if (practices.length > 0) {
        totalProgress += (practices.filter(p => p.isCompleted).length / practices.length);
      }
    });
    
    return Math.round((totalProgress / managerTeams.length) * 100);
  };

  const chartData = managers
    .filter(manager => selectedManagers.includes(manager.id))
    .map(manager => ({
      name: manager.name,
      progress: getManagerProgress(manager.id)
    }));

  return (
    <Card className="p-6">
      <div className="flex flex-wrap gap-4 mb-4">
        {managers.map((manager) => (
          <div key={manager.id} className="flex items-center space-x-2">
            <Checkbox
              id={`manager-${manager.id}`}
              checked={selectedManagers.includes(manager.id)}
              onCheckedChange={() => toggleManager(manager.id)}
            />
            <label
              htmlFor={`manager-${manager.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {manager.name}
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