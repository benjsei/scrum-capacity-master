import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import AgilePractices from "@/components/AgilePractices";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TeamPractices = () => {
  const { activeTeam } = useScrumTeamStore();
  const { initializePractices, getPracticesForTeam } = useAgilePracticesStore();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [completionFilter, setCompletionFilter] = useState<string>("all");
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  useEffect(() => {
    if (activeTeam) {
      initializePractices(activeTeam.id);
    }
  }, [activeTeam, initializePractices]);

  useEffect(() => {
    if (activeTeam) {
      const practices = getPracticesForTeam(activeTeam.id);
      const dayOrder = ["N", "N + 1", "N + 5", "N + 14"];
      
      const firstDayWithIncomplete = dayOrder.find(day => 
        practices.some(practice => 
          practice.day === day && !practice.isCompleted
        )
      );

      if (firstDayWithIncomplete) {
        setExpandedDays([firstDayWithIncomplete]);
      }
    }
  }, [activeTeam, getPracticesForTeam]);

  if (!activeTeam) {
    navigate('/');
    return null;
  }

  const practices = getPracticesForTeam(activeTeam.id);
  
  // Get unique types and actions for filters
  const uniqueTypes = Array.from(new Set(practices.map(p => p.type))).sort();
  const uniqueActions = Array.from(new Set(practices.map(p => p.action))).sort();

  // Filter practices based on selected filters
  const filteredPractices = practices.filter(practice => {
    const dayMatch = selectedDay === "all" || practice.day === selectedDay;
    const typeMatch = selectedType === "all" || practice.type === selectedType;
    const actionMatch = selectedAction === "all" || practice.action === selectedAction;
    const completionMatch = 
      completionFilter === "all" || 
      (completionFilter === "completed" && practice.isCompleted) ||
      (completionFilter === "pending" && !practice.isCompleted);
    
    return dayMatch && typeMatch && actionMatch && completionMatch;
  });

  // Group practices by day
  const practicesByDay = filteredPractices.reduce((acc, practice) => {
    if (!acc[practice.day]) {
      acc[practice.day] = [];
    }
    acc[practice.day].push(practice);
    return acc;
  }, {} as Record<string, typeof filteredPractices>);

  const getDayProgress = (dayPractices) => {
    if (!dayPractices || dayPractices.length === 0) return 0;
    return Math.round(dayPractices.filter(p => p.isCompleted).length / dayPractices.length * 100);
  };

  const totalProgress = practices.length > 0 
    ? Math.round(practices.filter(p => p.isCompleted).length / practices.length * 100)
    : 0;

  // Order days according to specification
  const dayOrder = ["N", "N + 1", "N + 5", "N + 14"];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{activeTeam.name}</h1>
            <p className="text-muted-foreground">Suivi des pratiques agiles</p>
          </div>
        </div>
        <Card className="p-4 flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          <Progress value={totalProgress} className="w-[100px]" />
        </Card>
      </header>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par jour" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les jours</SelectItem>
            {dayOrder.map(day => (
              <SelectItem key={day} value={day}>Jour {day}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action}>{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={completionFilter} onValueChange={setCompletionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les pratiques</SelectItem>
            <SelectItem value="completed">Terminées</SelectItem>
            <SelectItem value="pending">Non terminées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion 
        type="multiple" 
        className="space-y-8"
        value={expandedDays}
        onValueChange={setExpandedDays}
      >
        {dayOrder.map(day => {
          const dayPractices = practicesByDay[day] || [];
          if (dayPractices.length === 0) return null;

          return (
            <AccordionItem key={day} value={day} className="border-none">
              <div className="flex items-center justify-between mb-4">
                <AccordionTrigger className="hover:no-underline">
                  <h2 className="text-2xl font-bold">Jour {day}</h2>
                </AccordionTrigger>
                <Card className="p-2 flex items-center gap-2">
                  <Progress value={getDayProgress(dayPractices)} className="w-[100px]" />
                </Card>
              </div>
              <AccordionContent>
                <AgilePractices teamId={activeTeam.id} dayFilter={day} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default TeamPractices;