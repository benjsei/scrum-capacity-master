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
  const [localCapacities, setLocalCapacities] = useState(resource.dailyCapacities || []);

  // Calcul local du total des jours de présence
  const calculateLocalTotal = (capacities: Resource['dailyCapacities']) => {
    if (!capacities) return 0;
    return capacities.reduce((sum, dc) => sum + (dc.capacity || 0), 0);
  };

  // Mise à jour du total local quand les capacités changent
  useEffect(() => {
    setLocalCapacities(resource.dailyCapacities || []);
  }, [resource.dailyCapacities]);

  useEffect(() => {
    const newTotal = calculateLocalTotal(localCapacities);
    console.log("Nouveau total calculé:", newTotal, "pour les capacités:", localCapacities);
    setLocalTotal(newTotal);
  }, [localCapacities]);

  const handleDailyCapacityChange = (resourceId: string, date: string, capacity: number) => {
    onDailyCapacityChange(resourceId, date, capacity);
    
    // Mise à jour immédiate du state local
    const updatedCapacities = localCapacities.map(dc => 
      dc.date === date ? { ...dc, capacity: capacity || 0 } : dc
    );
    
    setLocalCapacities(updatedCapacities);
    const newTotal = calculateLocalTotal(updatedCapacities);
    console.log("Total mis à jour après changement:", newTotal);
    setLocalTotal(newTotal);
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