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
  const { 
    initializePractices, 
    getPracticesForTeam, 
    togglePracticeCompletion, 
    updatePracticeUrl 
  } = useAgilePracticesStore();
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [currentIncompleteIndex, setCurrentIncompleteIndex] = useState(0);
  
  useEffect(() => {
    if (activeTeam) {
      initializePractices(activeTeam.id);
    }
  }, [activeTeam, initializePractices]);

  useEffect(() => {
    if (activeTeam) {
      const practices = getPracticesForTeam(activeTeam.id);
      const dayOrder = ["N", "N+1", "N+5", "N+14"];
      setExpandedDays(dayOrder);
    }
  }, [activeTeam, getPracticesForTeam]);

  if (!activeTeam) {
    navigate('/');
    return null;
  }

  const handleBack = () => {
    if (activeTeam.managerId) {
      navigate(`/teams/${activeTeam.managerId}`);
    } else {
      navigate('/');
    }
  };

  const practices = getPracticesForTeam(activeTeam.id);
  const dayOrder = ["N", "N+1", "N+5", "N+14"];
  
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

  const firstIncompletePractice = practices.find(p => !p.isCompleted);
  const incompletePractices = practices.filter(p => !p.isCompleted);
  const currentIncompletePractice = incompletePractices[currentIncompleteIndex];

  const handlePreviousIncompletePractice = () => {
    if (currentIncompleteIndex > 0) {
      setCurrentIncompleteIndex(prev => prev - 1);
    }
  };

  const handleNextIncompletePractice = () => {
    if (currentIncompleteIndex < incompletePractices.length - 1) {
      setCurrentIncompleteIndex(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Pratiques et Capacité Scrum</h1>
        <p className="text-muted-foreground mb-4">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DayProgressCard progress={totalProgress} />
        </div>
      </div>

      {currentIncompletePractice && (
        <NextPracticeCard
          practice={currentIncompletePractice}
          teamId={activeTeam.id}
          onToggleCompletion={togglePracticeCompletion}
          onUpdateUrl={updatePracticeUrl}
          onPrevious={handlePreviousIncompletePractice}
          onNext={handleNextIncompletePractice}
          hasPrevious={currentIncompleteIndex > 0}
          hasNext={currentIncompleteIndex < incompletePractices.length - 1}
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
              <AgilePractices 
                teamId={activeTeam.id} 
                dayFilter={day} 
                firstIncompletePracticeId={firstIncompletePractice?.id}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TeamPractices;
