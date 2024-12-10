import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { Resource } from '../types/sprint';
import { toast } from "sonner";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { SprintDatesInput } from './sprint/SprintDatesInput';
import { SprintCapacityInfo } from './sprint/SprintCapacityInfo';
import { SprintResourcesSection } from './sprint/SprintResourcesSection';

export const SprintForm = () => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [resources, setResources] = useState<Resource[]>([
    { id: '1', name: '', capacityPerDay: 1, dailyCapacities: [] }
  ]);
  const [storyPoints, setStoryPoints] = useState('');
  const [showDailyCapacities, setShowDailyCapacities] = useState<{ [key: string]: boolean }>({});
  const [theoreticalCapacity, setTheoreticalCapacity] = useState(0);
  const [resourcePresenceDays, setResourcePresenceDays] = useState<{ [key: string]: number }>({});

  const { addSprint, calculateTheoreticalCapacity, getAverageVelocity, sprints } = useSprintStore();
  const averageVelocity = getAverageVelocity();

  useEffect(() => {
    if (sprints.length > 0 && !startDate) {
      const lastSprint = sprints[sprints.length - 1];
      const nextDay = new Date(lastSprint.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setStartDate(nextDay.toISOString().split('T')[0]);
    }
  }, [sprints]);

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
          
          if (!resource.dailyCapacities.find(dc => dc.date === dateStr)) {
            resource.dailyCapacities.push({
              date: dateStr,
              capacity: resource.capacityPerDay
            });
          }
        }
      });
      setResources([...resources]);
    }
  }, [startDate, duration, resources.length]);

  useEffect(() => {
    if (duration && resources.length > 0) {
      const capacity = calculateTheoreticalCapacity(resources, Number(duration));
      setTheoreticalCapacity(capacity);

      const presenceDays = resources.reduce((acc, resource) => {
        const total = resource.dailyCapacities?.reduce((sum, dc) => sum + dc.capacity, 0) || 0;
        return { ...acc, [resource.id]: total };
      }, {});
      setResourcePresenceDays(presenceDays);
    }
  }, [duration, resources, calculateTheoreticalCapacity]);

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

  const toggleDailyCapacities = (resourceId: string) => {
    setShowDailyCapacities(prev => ({
      ...prev,
      [resourceId]: !prev[resourceId]
    }));
  };

  const { activeTeam } = useScrumTeamStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTeam) {
      toast.error("Please select a team first");
      return;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration));

    const newSprint = {
      id: Date.now().toString(),
      teamId: activeTeam.id,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      duration: Number(duration),
      resources,
      storyPointsCommitted: Number(storyPoints),
      theoreticalCapacity,
    };

    addSprint(newSprint);
    toast.success('Sprint created successfully!');
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <SprintDatesInput
          startDate={startDate}
          duration={duration}
          onStartDateChange={setStartDate}
          onDurationChange={setDuration}
        />

        <SprintResourcesSection
          resources={resources}
          showDailyCapacities={showDailyCapacities}
          resourcePresenceDays={resourcePresenceDays}
          onResourceChange={handleResourceChange}
          onDailyCapacityChange={handleDailyCapacityChange}
          onToggleDailyCapacities={toggleDailyCapacities}
          onAddResource={handleAddResource}
        />

        <SprintCapacityInfo
          averageVelocity={averageVelocity}
          theoreticalCapacity={theoreticalCapacity}
          storyPoints={storyPoints}
          onStoryPointsChange={setStoryPoints}
        />

        <Button type="submit" className="w-full">
          Create Sprint
        </Button>
      </form>
    </Card>
  );
};