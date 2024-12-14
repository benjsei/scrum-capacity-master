import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { useResourceStore } from "../store/resourceStore";
import { Resource } from "../types/sprint";
import { cn } from "@/lib/utils";
import { useScrumTeamStore } from "../store/scrumTeamStore";

interface ResourceAutocompleteInputProps {
  value: string;
  onChange: (resource: Resource) => void;
  className?: string;
}

export const ResourceAutocompleteInput = ({
  value,
  onChange,
  className
}: ResourceAutocompleteInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Resource[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { findResources } = useResourceStore();
  const { activeTeam } = useScrumTeamStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.trim()) {
      const foundResources = findResources(newValue);
      setSuggestions(foundResources);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (resource: Resource) => {
    setInputValue(resource.name);
    onChange(resource);
    setShowSuggestions(false);
  };

  const handleInputBlur = async () => {
    setTimeout(async () => {
      if (inputValue.trim() && inputValue !== value && activeTeam) {
        const existingResource = findResources(inputValue.trim())[0];
        if (existingResource) {
          onChange(existingResource);
        } else {
          const newResource: Resource = {
            id: crypto.randomUUID(),
            name: inputValue.trim(),
            capacityPerDay: 1,
            teamId: activeTeam.id,
            isTemporary: true // Mark as temporary until sprint is saved
          };
          console.log('Creating temporary resource:', newResource);
          onChange(newResource);
        }
      }
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={className}
        placeholder="Nom de la ressource"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {suggestions.map((resource) => (
            <div
              key={resource.id}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-gray-100",
                "text-sm text-gray-700"
              )}
              onClick={() => handleSuggestionClick(resource)}
            >
              {resource.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};