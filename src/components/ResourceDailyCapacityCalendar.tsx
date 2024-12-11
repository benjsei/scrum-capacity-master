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

export const ResourceDailyCapacityCalendar = ({
  resource,
  onDailyCapacityChange,
  showDailyCapacities,
  onToggleDailyCapacities,
}: ResourceDailyCapacityCalendarProps) => {
  const groupCapacitiesByWeek = () => {
    if (!resource.dailyCapacities) return [];
    
    const weeks: ResourceDailyCapacity[][] = [];
    let currentWeek: ResourceDailyCapacity[] = [];
    
    resource.dailyCapacities.forEach((dc) => {
      const date = new Date(dc.date);
      const dayOfWeek = date.getDay();
      const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      if (currentWeek.length === 0 || mondayBasedDay === 0) {
        if (currentWeek.length > 0) weeks.push(currentWeek);
        currentWeek = [dc];
      } else {
        currentWeek.push(dc);
      }
    });
    
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  };

  const getDayOfWeek = (date: Date) => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1;
  };

  return (
    <div className="space-y-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onToggleDailyCapacities}
      >
        {showDailyCapacities ? 'Masquer le détail' : 'Afficher le détail'}
      </Button>
      
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
                const isWeekend = getDayOfWeek(date) >= 5;
                
                return (
                  <div 
                    key={dc.date} 
                    className={cn(
                      "p-2 rounded border",
                      isWeekend ? "bg-gray-100" : "bg-white"
                    )}
                  >
                    <Label className="text-xs block mb-1">
                      {date.getDate()}/{date.getMonth() + 1}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={dc.capacity}
                      onChange={(e) => onDailyCapacityChange(resource.id, dc.date, Number(e.target.value))}
                      className="h-8 text-sm"
                    />
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