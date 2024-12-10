import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSprintStore } from '../store/sprintStore';
import { Sprint } from "../types/sprint";
import { ResourceInput } from "./ResourceInput";
import { toast } from "sonner";
import { TableCell } from "./ui/table";

interface SprintEditFormProps {
  sprint: Sprint;
  onCancel: () => void;
  onSave: () => void;
}

export const SprintEditForm = ({ sprint, onCancel, onSave }: SprintEditFormProps) => {
  const [editedSprint, setEditedSprint] = useState<Sprint>({ ...sprint });
  const { updateSprint } = useSprintStore();

  const handleSave = () => {
    if (new Date(editedSprint.startDate) > new Date(editedSprint.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    updateSprint(sprint.id, editedSprint);
    toast.success("Sprint updated successfully!");
    onSave();
  };

  const handleResourceChange = (resourceId: string, field: keyof Resource, value: string | number) => {
    setEditedSprint(prev => ({
      ...prev,
      resources: prev.resources.map(resource =>
        resource.id === resourceId ? { ...resource, [field]: value } : resource
      )
    }));
  };

  const handleDailyCapacityChange = (resourceId: string, date: string, capacity: number) => {
    setEditedSprint(prev => ({
      ...prev,
      resources: prev.resources.map(resource =>
        resource.id === resourceId
          ? {
              ...resource,
              dailyCapacities: resource.dailyCapacities?.map(dc =>
                dc.date === date ? { ...dc, capacity } : dc
              ) || []
            }
          : resource
      )
    }));
  };

  return (
    <>
      <TableCell colSpan={6}>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={editedSprint.startDate}
                onChange={(e) => setEditedSprint(prev => ({
                  ...prev,
                  startDate: e.target.value
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (days)</label>
              <Input
                type="number"
                min="1"
                value={editedSprint.duration}
                onChange={(e) => setEditedSprint(prev => ({
                  ...prev,
                  duration: Number(e.target.value)
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Story Points Committed</label>
            <Input
              type="number"
              min="0"
              value={editedSprint.storyPointsCommitted}
              onChange={(e) => setEditedSprint(prev => ({
                ...prev,
                storyPointsCommitted: Number(e.target.value)
              }))}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Resources</label>
            {editedSprint.resources.map((resource) => (
              <ResourceInput
                key={resource.id}
                resource={resource}
                onResourceChange={handleResourceChange}
                onDailyCapacityChange={handleDailyCapacityChange}
                showDailyCapacities={{}}
                onToggleDailyCapacities={() => {}}
                totalPresenceDays={0}
              />
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </TableCell>
    </>
  );
};