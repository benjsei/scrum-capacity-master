import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSprintStore } from '../store/sprintStore';
import { toast } from "sonner";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { SprintDatesInput } from './sprint/SprintDatesInput';
import { SprintCapacityInfo } from './sprint/SprintCapacityInfo';
import { SprintResourcesSection } from './sprint/SprintResourcesSection';
import { useSprintResources } from '../hooks/useSprintResources';
import { useSprintValidation } from '../hooks/useSprintValidation';

interface SprintFormProps {
  onComplete: () => void;
}

export const SprintForm = ({ onComplete }: SprintFormProps) => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('10');
  const [storyPoints, setStoryPoints] = useState('');
  const [showDailyCapacities, setShowDailyCapacities] = useState(false);
  const [theoreticalCapacity, setTheoreticalCapacity] = useState(0);
  const [resourcePresenceDays, setResourcePresenceDays] = useState<{ [key: string]: number }>({});

  const { addSprint, calculateTheoreticalCapacity, getAverageVelocity } = useSprintStore();
  const { activeTeam } = useScrumTeamStore();
  const { resources, handleAddResource, handleResourceChange, handleDailyCapacityChange, updateResourceDates } = useSprintResources(startDate, duration);
  const { validateSprint } = useSprintValidation();
  const averageVelocity = getAverageVelocity();

  useEffect(() => {
    if (!startDate) {
      const today = new Date();
      today.setDate(today.getDate() + 1);
      setStartDate(today.toISOString().split('T')[0]);
      setDuration('14');
    }
  }, []);

  useEffect(() => {
    if (startDate && duration) {
      updateResourceDates(startDate, Number(duration));
    }
  }, [startDate, duration]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSprint(startDate, duration)) {
      return;
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration) - 1);

    const newSprint = {
      id: Date.now().toString(),
      teamId: activeTeam!.id,
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      duration: Number(duration),
      resources,
      storyPointsCommitted: Number(storyPoints),
      theoreticalCapacity,
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

        <SprintResourcesSection
          resources={resources}
          showDailyCapacities={showDailyCapacities}
          resourcePresenceDays={resourcePresenceDays}
          onResourceChange={handleResourceChange}
          onDailyCapacityChange={handleDailyCapacityChange}
          onToggleDailyCapacities={() => setShowDailyCapacities(!showDailyCapacities)}
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