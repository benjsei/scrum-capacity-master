import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AgilePractices from "@/components/AgilePractices";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import NextPracticeCard from '@/components/NextPracticeCard';
import DayProgressCard from '@/components/DayProgressCard';

const TeamPractices = () => {
  const { activeTeam } = useScrumTeamStore();
  const { initializePractices, getPracticesForTeam } = useAgilePracticesStore();
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  useEffect(() => {
    if (activeTeam) {
      initializePractices(activeTeam.id);
    }
  }, [activeTeam, initializePractices]);

  useEffect(() => {
    if (activeTeam) {
      const practices = getPracticesForTeam(activeTeam.id);
      // Initialize with all days expanded
      const dayOrder = ["N", "N + 1", "N + 5", "N + 14"];
      setExpandedDays(dayOrder);
    }
  }, [activeTeam, getPracticesForTeam]);

  if (!activeTeam) {
    navigate('/');
    return null;
  }

  const practices = getPracticesForTeam(activeTeam.id);
  
  // Order days according to specification
  const dayOrder = ["N", "N + 1", "N + 5", "N + 14"];
  
  // Group practices by day
  const practicesByDay = dayOrder.reduce((acc, day) => {
    const dayPractices = practices.filter(practice => practice.day === day);
    if (dayPractices.length > 0) {
      acc[day] = dayPractices;
    }
    return acc;
  }, {} as Record<string, typeof practices>);

  const getDayProgress = (dayPractices) => {
    if (!dayPractices || dayPractices.length === 0) return 0;
    return Math.round(dayPractices.filter(p => p.isCompleted).length / dayPractices.length * 100);
  };

  const totalProgress = practices.length > 0 
    ? Math.round(practices.filter(p => p.isCompleted).length / practices.length * 100)
    : 0;

  // Find first incomplete practice
  const firstIncompletePractice = practices.find(p => !p.isCompleted);

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
        <DayProgressCard progress={totalProgress} />
      </header>

      {firstIncompletePractice && (
        <NextPracticeCard
          practice={firstIncompletePractice}
          teamId={activeTeam.id}
          onToggleCompletion={togglePracticeCompletion}
          onUpdateUrl={updatePracticeUrl}
        />
      )}

      <Accordion 
        type="multiple" 
        className="space-y-8"
        value={expandedDays}
        onValueChange={setExpandedDays}
      >
        {Object.entries(practicesByDay).map(([day, dayPractices]) => (
          <AccordionItem key={day} value={day} className="border-none">
            <div className="flex items-center justify-between mb-4">
              <AccordionTrigger className="hover:no-underline">
                <h2 className="text-2xl font-bold">Jour {day}</h2>
              </AccordionTrigger>
              <DayProgressCard progress={getDayProgress(dayPractices)} small />
            </div>
            <AccordionContent>
              <AgilePractices teamId={activeTeam.id} dayFilter={day} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TeamPractices;