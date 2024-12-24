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
import { SprintPersonDaysInput } from './sprint/SprintPersonDaysInput';

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
  const [totalPersonDays, setTotalPersonDays] = useState<number | undefined>(undefined);

  const { addSprint, calculateTheoreticalCapacity, getAverageVelocity, loadSprints, getActiveTeamSprints } = useSprintStore();
  const { activeTeam } = useScrumTeamStore();
  const averageVelocity = getAverageVelocity();
  const teamSprints = getActiveTeamSprints();

  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  useEffect(() => {
    if (activeTeam?.resources) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      setStartDate(tomorrowStr);
      setDuration('14');

      const initializedResources = initializeSprintResources(
        activeTeam.resources,
        tomorrowStr,
        14
      );
      setResources(initializedResources);
    }
  }, [activeTeam]);

  useEffect(() => {
    if (duration && resources.length > 0) {
      const capacity = calculateTheoreticalCapacity(resources, Number(duration));
      setTheoreticalCapacity(capacity);
    } else if (duration && totalPersonDays) {
      const capacity = averageVelocity * totalPersonDays;
      setTheoreticalCapacity(capacity);
    }
  }, [duration, resources, totalPersonDays, calculateTheoreticalCapacity, averageVelocity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTeam) {
      toast.error("Veuillez sélectionner une équipe");
      return;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration) - 1);

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
      totalPersonDays: resources.length === 0 ? totalPersonDays : undefined,
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

        {activeTeam?.resources && activeTeam.resources.length > 0 ? (
          <SprintResourcesSection
            resources={resources}
            showDailyCapacities={showDailyCapacities}
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
            startDate={startDate}
            duration={Number(duration)}
          />
        ) : (
          <SprintPersonDaysInput
            totalPersonDays={totalPersonDays}
            onTotalPersonDaysChange={setTotalPersonDays}
          />
        )}

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