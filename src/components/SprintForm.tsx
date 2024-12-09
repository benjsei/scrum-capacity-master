import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSprintStore } from '../store/sprintStore';
import { Resource, ResourceDailyCapacity } from '../types/sprint';
import { toast } from 'sonner';

export const SprintForm = () => {
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [resources, setResources] = useState<Resource[]>([
    { id: '1', name: '', capacityPerDay: 1, dailyCapacities: [] }
  ]);
  const [storyPoints, setStoryPoints] = useState('');
  const [showDailyCapacities, setShowDailyCapacities] = useState<{ [key: string]: boolean }>({});

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
              <div key={resource.id} className="space-y-2">
                <div className="flex gap-4">
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
                    placeholder="Default Capacity/day"
                    value={resource.capacityPerDay}
                    onChange={(e) => handleResourceChange(resource.id, 'capacityPerDay', Number(e.target.value))}
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => toggleDailyCapacities(resource.id)}
                  >
                    {showDailyCapacities[resource.id] ? 'Hide Daily' : 'Show Daily'}
                  </Button>
                </div>
                
                {showDailyCapacities[resource.id] && resource.dailyCapacities && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                    {resource.dailyCapacities.map((dc) => (
                      <div key={dc.date} className="flex flex-col space-y-1">
                        <Label className="text-xs">{new Date(dc.date).toLocaleDateString()}</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={dc.capacity}
                          onChange={(e) => handleDailyCapacityChange(resource.id, dc.date, Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    ))}
                  </div>
                )}
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