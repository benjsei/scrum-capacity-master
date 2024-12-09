import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSprintStore } from '../store/sprintStore';
import { Resource } from '../types/sprint';
import { toast } from 'sonner';
import { ResourceInput } from './ResourceInput';

export const SprintForm = () => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [resources, setResources] = useState<Resource[]>([
    { id: '1', name: '', capacityPerDay: 1, dailyCapacities: [] }
  ]);
  const [storyPoints, setStoryPoints] = useState('');
  const [showDailyCapacities, setShowDailyCapacities] = useState<{ [key: string]: boolean }>({});
  const [theoreticalCapacity, setTheoreticalCapacity] = useState(0);

  const { addSprint, calculateTheoreticalCapacity } = useSprintStore();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration));

    const newSprint = {
      id: Date.now().toString(),
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Resources</Label>
            {resources.map((resource) => (
              <ResourceInput
                key={resource.id}
                resource={resource}
                onResourceChange={handleResourceChange}
                onDailyCapacityChange={handleDailyCapacityChange}
                showDailyCapacities={showDailyCapacities}
                onToggleDailyCapacities={toggleDailyCapacities}
              />
            ))}
            <Button type="button" variant="outline" onClick={handleAddResource}>
              Add Resource
            </Button>
          </div>

          <div>
            <Label htmlFor="theoreticalCapacity">Theoretical Capacity (SP)</Label>
            <Input
              id="theoreticalCapacity"
              type="number"
              value={theoreticalCapacity.toFixed(1)}
              readOnly
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="storyPoints">Story Points Committed</Label>
            <Input
              id="storyPoints"
              type="number"
              min="0"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Create Sprint
        </Button>
      </form>
    </Card>
  );
};