import { Button } from "./ui/button";
import { Resource } from "../types/sprint";
import { DayCell } from "./calendar/DayCell";
import { WeekHeader } from "./calendar/WeekHeader";
import { PresetButtons, PRESET_VALUES } from "./calendar/PresetButtons";
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
  // State local pour suivre les capacités
  const [localCapacities, setLocalCapacities] = useState(resource.dailyCapacities || []);

  // Mise à jour du state local quand les props changent
  useEffect(() => {
    setLocalCapacities(resource.dailyCapacities || []);
  }, [resource.dailyCapacities]);

  const applyPresetValue = (value: number) => {
    if (!localCapacities) {
      console.log("Pas de dailyCapacities trouvé");
      return;
    }

    console.log("Capacités avant application:", localCapacities);
    
    // On crée une copie des capacités pour les modifications
    const updatedCapacities = localCapacities.map(dc => {
      const date = new Date(dc.date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (!isWeekend) {
        console.log(`Mise à jour de la capacité pour ${dc.date} à ${value}`);
        onDailyCapacityChange(resource.id, dc.date, value);
        return { ...dc, capacity: value };
      }
      return dc;
    });
    
    // Mise à jour du state local
    setLocalCapacities(updatedCapacities);
    console.log("Capacités après application:", updatedCapacities);
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
        // Fill empty days at start of week
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
        // Complete current week and start new one
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
        // Fill gaps in current week
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
                    onCapacityChange={(newCapacity) => {
                      onDailyCapacityChange(resource.id, dc.date, newCapacity);
                      setLocalCapacities(prev => 
                        prev.map(cap => 
                          cap.date === dc.date ? { ...cap, capacity: newCapacity } : cap
                        )
                      );
                    }}
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