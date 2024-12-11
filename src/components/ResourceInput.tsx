import { Input } from "./ui/input";
import { Resource } from "../types/sprint";
import { ResourceDailyCapacityCalendar } from "./ResourceDailyCapacityCalendar";
import { useMemo } from "react";

interface ResourceInputProps {
  resource: Resource;
  onResourceChange: (id: string, field: keyof Resource, value: string | number) => void;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  showDailyCapacities: boolean;
  onToggleDailyCapacities: () => void;
  totalPresenceDays: number;
}

export const ResourceInput = ({
  resource,
  onResourceChange,
  onDailyCapacityChange,
  showDailyCapacities,
  onToggleDailyCapacities,
  totalPresenceDays,
}: ResourceInputProps) => {
  // Calcul du total directement à partir des props
  const total = useMemo(() => {
    if (!resource.dailyCapacities) return 0;
    return resource.dailyCapacities.reduce((sum, dc) => sum + (dc.capacity || 0), 0);
  }, [resource.dailyCapacities]);

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Input
          value={resource.name}
          onChange={(e) => {
            const value = e.target.value;
            onResourceChange(resource.id, 'name', value);
          }}
          className="w-full"
          placeholder="Nom de la ressource"
        />
        <Input
          type="number"
          value={total.toFixed(1)}
          readOnly
          className="bg-muted w-32"
        />
      </div>
      
      <ResourceDailyCapacityCalendar
        resource={resource}
        onDailyCapacityChange={onDailyCapacityChange}
        showDailyCapacities={showDailyCapacities}
        onToggleDailyCapacities={onToggleDailyCapacities}
      />
    </div>
  );
};