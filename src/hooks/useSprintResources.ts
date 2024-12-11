import { useState, useEffect } from 'react';
import { Resource } from '../types/sprint';
import { useSprintStore } from '../store/sprintStore';
import { useScrumTeamStore } from '../store/scrumTeamStore';

export const useSprintResources = (startDate: string, duration: string) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const { sprints } = useSprintStore();
  const { activeTeam } = useScrumTeamStore();

  useEffect(() => {
    if (activeTeam) {
      const teamSprints = sprints.filter(s => s.teamId === activeTeam.id);
      if (teamSprints.length > 0) {
        const lastSprint = teamSprints[teamSprints.length - 1];
        const lastSprintResources = lastSprint.resources.map(r => ({
          ...r,
          id: String(Date.now() + Math.random()),
          dailyCapacities: []
        }));
        setResources(lastSprintResources);
      }
    }
  }, [activeTeam, sprints]);

  useEffect(() => {
    if (startDate && duration) {
      const start = new Date(startDate);
      resources.forEach(resource => {
        if (!resource.dailyCapacities) {
          resource.dailyCapacities = [];
        }
        
        for (let i = 0; i < parseInt(duration); i++) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          const dateStr = currentDate.toISOString().split('T')[0];
          
          const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
          const defaultCapacity = isWeekend ? 0 : resource.capacityPerDay;
          
          if (!resource.dailyCapacities.find(dc => dc.date === dateStr)) {
            resource.dailyCapacities.push({
              date: dateStr,
              capacity: defaultCapacity
            });
          }
        }

        if (resource.dailyCapacities.length > parseInt(duration)) {
          resource.dailyCapacities = resource.dailyCapacities.slice(0, parseInt(duration));
        }
      });
      setResources([...resources]);
    }
  }, [startDate, duration, resources.length]);

  const handleAddResource = () => {
    setResources([
      ...resources,
      { id: String(resources.length + 1), name: '', capacityPerDay: 1, dailyCapacities: [] }
    ]);
  };

  const handleResourceChange = (id: string, field: keyof Resource, value: string | number) => {
    setResources(resources.map(resource =>
      resource.id === id ? { ...resource, [field]: value } : resource
    ));
  };

  const handleDailyCapacityChange = (resourceId: string, date: string, capacity: number) => {
    setResources(resources.map(resource => {
      if (resource.id === resourceId) {
        const updatedCapacities = resource.dailyCapacities?.map(dc =>
          dc.date === date ? { ...dc, capacity } : dc
        ) || [];
        return { ...resource, dailyCapacities: updatedCapacities };
      }
      return resource;
    }));
  };

  return {
    resources,
    handleAddResource,
    handleResourceChange,
    handleDailyCapacityChange
  };
};