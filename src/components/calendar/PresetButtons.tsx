import { Button } from "../ui/button";

export const PRESET_VALUES = [
  { label: "Vide (0)", value: 0 },
  { label: "Mi-temps (0.5)", value: 0.5 },
  { label: "4/5 (0.8)", value: 0.8 },
  { label: "Plein (1)", value: 1 },
] as const;

interface PresetButtonsProps {
  onPresetClick: (value: number) => void;
}

export const PresetButtons = ({ onPresetClick }: PresetButtonsProps) => {
  return (
    <div className="flex gap-2">
      {PRESET_VALUES.map((preset) => (
        <Button
          key={preset.value}
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            console.log(`Clic sur le bouton ${preset.label}`);
            onPresetClick(preset.value);
          }}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
};