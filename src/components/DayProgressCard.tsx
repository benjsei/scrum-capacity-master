import { Card } from "@/components/ui/card";
import { Percent } from "lucide-react";

interface DayProgressCardProps {
  progress: number;
  small?: boolean;
}

const DayProgressCard = ({ progress, small = false }: DayProgressCardProps) => {
  return (
    <Card className={`${small ? 'p-2' : 'p-4'} flex items-center gap-2`}>
      <Percent className={`${small ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
      <span className={`${small ? 'font-medium' : 'text-lg font-semibold'}`}>{progress}%</span>
    </Card>
  );
};

export default DayProgressCard;