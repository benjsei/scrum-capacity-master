import { Input } from "./ui/input";
import { Resource } from "../types/sprint";
import { ResourceDailyCapacityCalendar } from "./ResourceDailyCapacityCalendar";
import { useResourceStore } from "../store/resourceStore";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
  const { resources } = useResourceStore();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(resource.name);

  const handleSelect = (value: string) => {
    onResourceChange(resource.id, 'name', value);
    setInputValue(value);
    setOpen(false);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onResourceChange(resource.id, 'name', value);
  };

  const filteredResources = resources?.filter(r => 
    r.name.toLowerCase().includes(inputValue.toLowerCase())
  ) || [];

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full"
              placeholder="Nom de la ressource"
              onClick={() => setOpen(true)}
            />
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher une ressource..." />
              <CommandEmpty>Aucune ressource trouvée.</CommandEmpty>
              <CommandGroup>
                {filteredResources.map(r => (
                  <CommandItem
                    key={r.id}
                    value={r.name}
                    onSelect={handleSelect}
                  >
                    {r.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          type="number"
          value={totalPresenceDays.toFixed(1)}
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