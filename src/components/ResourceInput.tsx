import { Input } from "./ui/input";
import { Resource } from "../types/sprint";
import { ResourceDailyCapacityInput } from "./ResourceDailyCapacityInput";

interface ResourceInputProps {
  resource: Resource;
  onResourceChange: (id: string, field: keyof Resource, value: string | number) => void;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  showDailyCapacities: { [key: string]: boolean };
  onToggleDailyCapacities: (resourceId: string) => void;
}

export const ResourceInput = ({
  resource,
  onResourceChange,
  onDailyCapacityChange,
  showDailyCapacities,
  onToggleDailyCapacities,
}: ResourceInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Input
          placeholder="Name"
          value={resource.name}
          onChange={(e) => onResourceChange(resource.id, 'name', e.target.value)}
          required
        />
        <Input
          type="number"
          step="0.1"
          min="0.1"
          placeholder="Default Capacity/day"
          value={resource.capacityPerDay}
          onChange={(e) => onResourceChange(resource.id, 'capacityPerDay', Number(e.target.value))}
          required
        />
      </div>
      
      <ResourceDailyCapacityInput
        resource={resource}
        onDailyCapacityChange={onDailyCapacityChange}
        showDailyCapacities={showDailyCapacities[resource.id]}
        onToggleDailyCapacities={() => onToggleDailyCapacities(resource.id)}
      />
    </div>
  );
};