import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSprintStore } from '../store/sprintStore';
import { Resource } from '../types/sprint';
import { toast } from 'sonner';

export const SprintForm = () => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [resources, setResources] = useState<Resource[]>([
    { id: '1', name: '', capacityPerDay: 1 }
  ]);
  const [storyPoints, setStoryPoints] = useState('');

  const { addSprint, calculateTheoreticalCapacity } = useSprintStore();

  const handleAddResource = () => {
    setResources([
      ...resources,
      { id: String(resources.length + 1), name: '', capacityPerDay: 1 }
    ]);
  };

  const handleResourceChange = (id: string, field: keyof Resource, value: string | number) => {
    setResources(resources.map(resource =>
      resource.id === id ? { ...resource, [field]: value } : resource
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration));

    const theoreticalCapacity = calculateTheoreticalCapacity(
      resources,
      Number(duration)
    );

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
              <div key={resource.id} className="flex gap-4">
                <Input
                  placeholder="Name"
                  value={resource.name}
                  onChange={(e) => handleResourceChange(resource.id, 'name', e.target.value)}
                  required
                />
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Capacity/day"
                  value={resource.capacityPerDay}
                  onChange={(e) => handleResourceChange(resource.id, 'capacityPerDay', Number(e.target.value))}
                  required
                />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddResource}>
              Add Resource
            </Button>
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