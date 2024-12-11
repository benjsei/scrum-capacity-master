import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Resource } from "../../types/sprint";
import { ResourceInput } from "../ResourceInput";

interface SprintResourcesSectionProps {
  resources: Resource[];
  showDailyCapacities: boolean;
  resourcePresenceDays: { [key: string]: number };
  onResourceChange: (id: string, field: keyof Resource, value: string | number) => void;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  onToggleDailyCapacities: () => void;
  onAddResource: () => void;
}

export const SprintResourcesSection = ({
  resources,
  showDailyCapacities,
  resourcePresenceDays,
  onResourceChange,
  onDailyCapacityChange,
  onToggleDailyCapacities,
  onAddResource,
}: SprintResourcesSectionProps) => {
  return (
    <div className="space-y-4">
      <Label>Resources</Label>
      {resources.map((resource) => (
        <ResourceInput
          key={resource.id}
          resource={resource}
          onResourceChange={onResourceChange}
          onDailyCapacityChange={onDailyCapacityChange}
          showDailyCapacities={showDailyCapacities}
          onToggleDailyCapacities={onToggleDailyCapacities}
          totalPresenceDays={resourcePresenceDays[resource.id] || 0}
        />
      ))}
      <Button type="button" variant="outline" onClick={onAddResource}>
        Add Resource
      </Button>
    </div>
  );
};