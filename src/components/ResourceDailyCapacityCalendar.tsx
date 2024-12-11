import { Button } from "./ui/button";
import { Resource } from "../types/sprint";
import { DayCell } from "./calendar/DayCell";
import { WeekHeader } from "./calendar/WeekHeader";
import { PresetButtons } from "./calendar/PresetButtons";
import { useState, useEffect } from "react";

interface ResourceDailyCapacityCalendarProps {
  resource: Resource;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  showDailyCapacities: boolean;
  onToggleDailyCapacities: () => void;
}

export const ResourceDailyCapacityCalendar = ({
  resource,
  onDailyCapacityChange,
  showDailyCapacities,
  onToggleDailyCapacities,
}: ResourceDailyCapacityCalendarProps) => {
  const [localCapacities, setLocalCapacities] = useState(resource.dailyCapacities || []);

  useEffect(() => {
    setLocalCapacities(resource.dailyCapacities || []);
  }, [resource.dailyCapacities]);

  const applyPresetValue = (value: number) => {
    if (!resource.dailyCapacities) return;

    // Simuler des mises à jour individuelles pour chaque jour
    resource.dailyCapacities.forEach(dc => {
      const date = new Date(dc.date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (!isWeekend) {
        // Appliquer la mise à jour comme si c'était une saisie manuelle
        handleCapacityChange(dc.date, value);
      }
    });
  };

  const groupCapacitiesByWeek = () => {
    if (!localCapacities) return [];
    
    const weeks: typeof localCapacities[] = [];
    let currentWeek: typeof localCapacities = [];
    
    const sortedCapacities = [...localCapacities].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedCapacities.forEach((dc) => {
      const date = new Date(dc.date);
      const dayOfWeek = date.getDay();
      const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      if (currentWeek.length === 0) {
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

  const handleCapacityChange = (date: string, newCapacity: number) => {
    // Mettre à jour l'état local
    setLocalCapacities(prev => 
      prev.map(cap => 
        cap.date === date ? { ...cap, capacity: newCapacity } : cap
      )
    );
    
    // Propager la mise à jour au parent
    onDailyCapacityChange(resource.id, date, newCapacity);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onToggleDailyCapacities}
        >
          {showDailyCapacities ? 'Masquer le détail' : 'Afficher le détail'}
        </Button>

        {showDailyCapacities && <PresetButtons onPresetClick={applyPresetValue} />}
      </div>
      
      {showDailyCapacities && localCapacities && localCapacities.length > 0 && (
        <div className="space-y-4">
          <WeekHeader />
          
          {groupCapacitiesByWeek().map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((dc) => {
                const date = new Date(dc.date);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isInSprintRange = localCapacities.some(
                  (originalDc) => originalDc.date === dc.date
                );
                
                return (
                  <DayCell
                    key={dc.date}
                    date={date}
                    capacity={dc.capacity}
                    isWeekend={isWeekend}
                    isInSprintRange={isInSprintRange}
                    onCapacityChange={(newCapacity) => handleCapacityChange(dc.date, newCapacity)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};