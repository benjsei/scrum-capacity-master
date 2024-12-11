import { Input } from "./ui/input";
import { Resource } from "../types/sprint";
import { ResourceDailyCapacityCalendar } from "./ResourceDailyCapacityCalendar";
import { useEffect, useState } from "react";

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
  const [localTotal, setLocalTotal] = useState(totalPresenceDays);

  // Calcul local du total des jours de présence
  const calculateLocalTotal = (capacities: Resource['dailyCapacities']) => {
    if (!capacities) return 0;
    return capacities.reduce((sum, dc) => sum + dc.capacity, 0);
  };

  // Mise à jour du total local quand les capacités changent
  useEffect(() => {
    const newTotal = calculateLocalTotal(resource.dailyCapacities);
    setLocalTotal(newTotal);
  }, [resource.dailyCapacities]);

  const handleDailyCapacityChange = (resourceId: string, date: string, capacity: number) => {
    onDailyCapacityChange(resourceId, date, capacity);
    
    // Mise à jour immédiate du total local
    const updatedCapacities = resource.dailyCapacities?.map(dc => 
      dc.date === date ? { ...dc, capacity } : dc
    ) || [];
    
    setLocalTotal(calculateLocalTotal(updatedCapacities));
  };

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
          value={localTotal.toFixed(1)}
          readOnly
          className="bg-muted w-32"
        />
      </div>
      
      <ResourceDailyCapacityCalendar
        resource={resource}
        onDailyCapacityChange={handleDailyCapacityChange}
        showDailyCapacities={showDailyCapacities}
        onToggleDailyCapacities={onToggleDailyCapacities}
      />
    </div>
  );
};