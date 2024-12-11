import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ResourceDailyCapacity, Resource } from "../types/sprint";
import { cn } from "@/lib/utils";

interface ResourceDailyCapacityCalendarProps {
  resource: Resource;
  onDailyCapacityChange: (resourceId: string, date: string, capacity: number) => void;
  showDailyCapacities: boolean;
  onToggleDailyCapacities: () => void;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const PRESET_VALUES = [
  { label: "Vide (0)", value: 0 },
  { label: "Mi-temps (0.5)", value: 0.5 },
  { label: "4/5 (0.8)", value: 0.8 },
  { label: "Plein (1)", value: 1 },
];

export const ResourceDailyCapacityCalendar = ({
  resource,
  onDailyCapacityChange,
  showDailyCapacities,
  onToggleDailyCapacities,
}: ResourceDailyCapacityCalendarProps) => {
  const applyPresetValue = (value: number) => {
    if (!resource.dailyCapacities) return;
    
    // Parcourir toutes les capacités et appliquer la valeur aux jours de semaine
    resource.dailyCapacities.forEach((dc) => {
      const date = new Date(dc.date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Si ce n'est pas un weekend, on applique la nouvelle valeur
      if (!isWeekend) {
        onDailyCapacityChange(resource.id, dc.date, value);
      }
    });
  };

  const groupCapacitiesByWeek = () => {
    if (!resource.dailyCapacities) return [];
    
    const weeks: ResourceDailyCapacity[][] = [];
    let currentWeek: ResourceDailyCapacity[] = [];
    
    const sortedCapacities = [...resource.dailyCapacities].sort((a, b) => 
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

        {showDailyCapacities && (
          <div className="flex gap-2">
            {PRESET_VALUES.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => applyPresetValue(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {showDailyCapacities && resource.dailyCapacities && (
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
                const isInSprintRange = resource.dailyCapacities?.some(
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
                        onChange={(e) => onDailyCapacityChange(resource.id, dc.date, Number(e.target.value))}
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
