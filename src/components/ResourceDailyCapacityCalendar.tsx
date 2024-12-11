import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ResourceDailyCapacity, Resource } from "../types/sprint";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useEffect } from "react";

interface ResourceDailyCapacityCalendarProps {
  resource: Resource;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  showDailyCapacities: boolean;
  onToggleDailyCapacities: () => void;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DEFAULT_CAPACITIES = [0, 0.5, 0.8, 1];

export const ResourceDailyCapacityCalendar = ({
  resource,
  onDailyCapacityChange,
  showDailyCapacities,
  onToggleDailyCapacities,
}: ResourceDailyCapacityCalendarProps) => {
  const [selectedCapacity, setSelectedCapacity] = useState<string>("1");
  const [localCapacities, setLocalCapacities] = useState<ResourceDailyCapacity[]>(resource.dailyCapacities || []);

  useEffect(() => {
    setLocalCapacities(resource.dailyCapacities || []);
  }, [resource.dailyCapacities]);

  const initializeCapacities = () => {
    if (!localCapacities || localCapacities.length === 0) return;
    
    const updatedCapacities = [...localCapacities];
    const selectedValue = Number(selectedCapacity);

    updatedCapacities.forEach((dc) => {
      const date = new Date(dc.date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (!isWeekend) {
        onDailyCapacityChange(resource.id, dc.date, selectedValue);
      }
    });

    setLocalCapacities(updatedCapacities);
  };

  const handleCapacityChange = (date: string, capacity: number) => {
    const updatedCapacities = localCapacities.map(dc =>
      dc.date === date ? { ...dc, capacity } : dc
    );
    setLocalCapacities(updatedCapacities);
    onDailyCapacityChange(resource.id, date, capacity);
  };

  const groupCapacitiesByWeek = () => {
    if (!localCapacities) return [];
    
    const weeks: ResourceDailyCapacity[][] = [];
    let currentWeek: ResourceDailyCapacity[] = [];
    
    const sortedCapacities = [...localCapacities].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedCapacities.forEach((dc) => {
      const date = new Date(dc.date);
      const dayOfWeek = date.getDay();
      const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      if (currentWeek.length === 0) {
        // Start a new week with empty slots before this day
        for (let i = 0; i < mondayBasedDay; i++) {
          const emptyDate = new Date(date);
          emptyDate.setDate(date.getDate() - (mondayBasedDay - i));
          currentWeek.push({
            date: emptyDate.toISOString().split('T')[0],
            capacity: 0
          });
        }
        currentWeek.push(dc);
      } else if (mondayBasedDay === 0 || currentWeek.length >= 7) {
        // Complete the current week with empty slots if needed
        while (currentWeek.length < 7) {
          const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
          lastDate.setDate(lastDate.getDate() + 1);
          currentWeek.push({
            date: lastDate.toISOString().split('T')[0],
            capacity: 0
          });
        }
        weeks.push(currentWeek);
        currentWeek = [dc];
      } else {
        // Fill any gaps between the last date and this one
        const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
        const daysToAdd = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) - 1;
        for (let i = 0; i < daysToAdd; i++) {
          const emptyDate = new Date(lastDate);
          emptyDate.setDate(lastDate.getDate() + i + 1);
          currentWeek.push({
            date: emptyDate.toISOString().split('T')[0],
            capacity: 0
          });
        }
        currentWeek.push(dc);
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
        lastDate.setDate(lastDate.getDate() + 1);
        currentWeek.push({
          date: lastDate.toISOString().split('T')[0],
          capacity: 0
        });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onToggleDailyCapacities}
        >
          {showDailyCapacities ? 'Masquer le détail' : 'Afficher le détail'}
        </Button>

        {showDailyCapacities && (
          <div className="flex items-center gap-2">
            <Label>Capacité par défaut:</Label>
            <Select
              value={selectedCapacity}
              onValueChange={(value) => setSelectedCapacity(value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_CAPACITIES.map((capacity) => (
                  <SelectItem key={capacity} value={capacity.toString()}>
                    {capacity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              type="button" 
              variant="secondary"
              onClick={initializeCapacities}
            >
              Appliquer
            </Button>
          </div>
        )}
      </div>
      
      {showDailyCapacities && localCapacities && (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center font-semibold text-sm p-2">
                {day}
              </div>
            ))}
          </div>
          
          {groupCapacitiesByWeek().map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((dc) => {
                const date = new Date(dc.date);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isInSprintRange = localCapacities?.some(
                  (originalDc) => originalDc.date === dc.date
                );
                
                return (
                  <div 
                    key={dc.date} 
                    className={cn(
                      "p-2 rounded border",
                      isWeekend ? "bg-gray-100" : "bg-white",
                      !isInSprintRange && "opacity-50"
                    )}
                  >
                    <Label className="text-xs block mb-1">
                      {date.getDate()}/{date.getMonth() + 1}
                    </Label>
                    {isInSprintRange ? (
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={dc.capacity}
                        onChange={(e) => handleCapacityChange(dc.date, Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};