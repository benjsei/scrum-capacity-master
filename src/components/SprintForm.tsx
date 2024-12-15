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
import { initializeSprintResources } from '@/utils/sprintResourcesUtils';

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

  const { addSprint, calculateTheoreticalCapacity, getAverageVelocity, loadSprints, getActiveTeamSprints } = useSprintStore();
  const { activeTeam } = useScrumTeamStore();
  const averageVelocity = getAverageVelocity();
  const teamSprints = getActiveTeamSprints();

  // Load sprints only once when component mounts
  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  // Initialize form with default values
  useEffect(() => {
    if (activeTeam) {
      // Set default start date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(tomorrow.toISOString().split('T')[0]);
      
      // Set default duration
      setDuration('14');

      // Initialize resources with all team resources
      if (activeTeam.resources) {
        const initializedResources = initializeSprintResources(
          activeTeam.resources,
          tomorrow.toISOString().split('T')[0],
          14
        );
        setResources(initializedResources);
      }
    }
  }, [activeTeam]);

  // Update daily capacities when start date or duration changes
  useEffect(() => {
    if (startDate && duration && resources.length > 0) {
      const updatedResources = initializeSprintResources(
        resources,
        startDate,
        parseInt(duration)
      );
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      await addSprint(newSprint);
      toast.success('Sprint créé avec succès!');
      onComplete();
    } catch (error) {
      console.error('Error creating sprint:', error);
      toast.error("Erreur lors de la création du sprint");
    }
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
          onResourceChange={(id, field, value) => {
            setResources(resources.map(resource =>
              resource.id === id ? { ...resource, [field]: value } : resource
            ));
          }}
          onDailyCapacityChange={(resourceId, date, capacity) => {
            setResources(resources.map(resource =>
              resource.id === resourceId
                ? {
                    ...resource,
                    dailyCapacities: resource.dailyCapacities?.map(dc =>
                      dc.date === date ? { ...dc, capacity } : dc
                    ) || []
                  }
                : resource
            ));
          }}
          onToggleDailyCapacities={() => setShowDailyCapacities(!showDailyCapacities)}
          onDeleteResource={(resourceId) => {
            setResources(resources.filter(r => r.id !== resourceId));
          }}
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