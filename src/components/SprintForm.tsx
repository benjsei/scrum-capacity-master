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
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface SprintFormProps {
  onComplete: () => void;
}

export const SprintForm = ({ onComplete }: SprintFormProps) => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('10');
  const [resources, setResources] = useState<Resource[]>([]);
  const [storyPoints, setStoryPoints] = useState('');
  const [objective, setObjective] = useState('');
  const [showDailyCapacities, setShowDailyCapacities] = useState(false);
  const [theoreticalCapacity, setTheoreticalCapacity] = useState(0);
  const [resourcePresenceDays, setResourcePresenceDays] = useState<{ [key: string]: number }>({});

  const { addSprint, calculateTheoreticalCapacity, getAverageVelocity, sprints } = useSprintStore();
  const { activeTeam } = useScrumTeamStore();
  const averageVelocity = getAverageVelocity();

  // Set default start date and duration based on last sprint
  useEffect(() => {
    if (activeTeam) {
      const teamSprints = sprints.filter(s => s.teamId === activeTeam.id);
      if (teamSprints.length > 0) {
        const lastSprint = teamSprints[teamSprints.length - 1];
        const nextDay = new Date(lastSprint.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setStartDate(nextDay.toISOString().split('T')[0]);
        setDuration(lastSprint.duration.toString());
      } else {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        setStartDate(today.toISOString().split('T')[0]);
        setDuration('14');
      }
    }
  }, [activeTeam, sprints]);

  // Initialize resources with default capacities
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

  const handleDeleteResource = (resourceId: string) => {
    setResources(resources.filter(resource => resource.id !== resourceId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration) - 1);

    // Check for overlapping sprints
    const hasOverlap = sprints.some(s => {
      if (s.teamId !== activeTeam.id) return false;
      const sprintStart = new Date(s.startDate);
      const sprintEnd = new Date(s.endDate);
      const newStart = new Date(startDate);
      const newEnd = endDate;
      
      return (
        (newStart >= sprintStart && newStart <= sprintEnd) ||
        (newEnd >= sprintStart && newEnd <= sprintEnd) ||
        (newStart <= sprintStart && newEnd >= sprintEnd)
      );
    });

    if (hasOverlap) {
      toast.error("Les dates du sprint se chevauchent avec un sprint existant");
      return;
    }

    const newSprint = {
      id: Date.now().toString(),
      teamId: activeTeam.id,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      duration: Number(duration),
      resources,
      storyPointsCommitted: Number(storyPoints),
      theoreticalCapacity,
      objective,
    };

    addSprint(newSprint);
    toast.success('Sprint créé avec succès!');
    onComplete();
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

        <div>
          <Label className="block text-sm font-medium mb-1">Objectif du sprint</Label>
          <Textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            maxLength={300}
            className="h-24"
            placeholder="Décrivez l'objectif principal du sprint..."
          />
        </div>

        <SprintResourcesSection
          resources={resources}
          showDailyCapacities={showDailyCapacities}
          resourcePresenceDays={resourcePresenceDays}
          onResourceChange={handleResourceChange}
          onDailyCapacityChange={handleDailyCapacityChange}
          onToggleDailyCapacities={() => setShowDailyCapacities(!showDailyCapacities)}
          onAddResource={handleAddResource}
          onDeleteResource={handleDeleteResource}
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
