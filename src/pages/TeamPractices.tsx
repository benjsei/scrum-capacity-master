import { AgilePractices } from "@/components/AgilePractices";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";

const TeamPractices = () => {
  const { activeTeam } = useScrumTeamStore();
  const { initializePractices, getPracticesForTeam } = useAgilePracticesStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTeam) {
      initializePractices(activeTeam.id);
    }
  }, [activeTeam, initializePractices]);

  if (!activeTeam) {
    navigate('/');
    return null;
  }

  const practices = getPracticesForTeam(activeTeam.id);
  const totalProgress = Math.round((practices.filter(p => p.isCompleted).length / practices.length) * 100);

  const practicesByDay = practices.reduce((acc, practice) => {
    if (!acc[practice.day]) {
      acc[practice.day] = [];
    }
    acc[practice.day].push(practice);
    return acc;
  }, {} as Record<string, typeof practices>);

  const getDayProgress = (dayPractices: typeof practices) => {
    return Math.round((dayPractices.filter(p => p.isCompleted).length / dayPractices.length) * 100);
  };

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
          <span className="text-lg font-semibold">{totalProgress}% complété</span>
        </Card>
      </header>

      <div className="space-y-8">
        {Object.entries(practicesByDay).sort().map(([day, dayPractices]) => (
          <div key={day} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Jour {day}</h2>
              <Card className="p-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <span className="font-medium">{getDayProgress(dayPractices)}%</span>
              </Card>
            </div>
            <AgilePractices teamId={activeTeam.id} dayFilter={day} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPractices;