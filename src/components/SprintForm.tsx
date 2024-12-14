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
  const [isInitialized, setIsInitialized] = useState(false);

  const { addSprint, calculateTheoreticalCapacity, getAverageVelocity, loadSprints, getActiveTeamSprints } = useSprintStore();
  const { activeTeam } = useScrumTeamStore();
  const averageVelocity = getAverageVelocity();
  const teamSprints = getActiveTeamSprints();

  // Load sprints only once when component mounts
  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  // Initialize form with default values only once
  useEffect(() => {
    if (!isInitialized && activeTeam) {
      if (teamSprints.length > 0) {
        const lastSprint = teamSprints[teamSprints.length - 1];
        const nextDay = new Date(lastSprint.endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setStartDate(nextDay.toISOString().split('T')[0]);
        setDuration(lastSprint.duration.toString());
        
        const lastSprintResources = lastSprint.resources.map(resource => ({
          ...resource,
          dailyCapacities: []
        }));
        setResources(lastSprintResources);
      } else {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        setStartDate(today.toISOString().split('T')[0]);
        setDuration('14');
      }
      setIsInitialized(true);
    }
  }, [activeTeam, teamSprints, isInitialized]);

  // Update daily capacities when start date, duration or resources change
  useEffect(() => {
    if (startDate && duration && resources.length > 0) {
      const updatedResources = resources.map(resource => {
        const start = new Date(startDate);
        const dailyCapacities = [];
        
        for (let i = 0; i < parseInt(duration); i++) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          const dateStr = currentDate.toISOString().split('T')[0];
          
          const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
          const defaultCapacity = isWeekend ? 0 : resource.capacityPerDay;
          
          const existingCapacity = resource.dailyCapacities?.find(dc => dc.date === dateStr);
          dailyCapacities.push({
            date: dateStr,
            capacity: existingCapacity?.capacity ?? defaultCapacity
          });
        }

        return {
          ...resource,
          dailyCapacities
        };
      });

      setResources(updatedResources);
    }
  }, [startDate, duration]);

  // Calculate theoretical capacity and resource presence days
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

  const handleAddResource = (resource: Resource) => {
    const start = new Date(startDate);
    const dailyCapacities = [];
    
    for (let i = 0; i < parseInt(duration); i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      dailyCapacities.push({
        date: dateStr,
        capacity: isWeekend ? 0 : resource.capacityPerDay
      });
    }

    setResources([...resources, { ...resource, dailyCapacities }]);
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
    const hasOverlap = teamSprints.some(s => {
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
          availableResources={activeTeam?.resources || []}
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

export default SprintForm;
