import { AgilePractices } from "@/components/AgilePractices";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TeamPractices = () => {
  const { activeTeam } = useScrumTeamStore();
  const { initializePractices } = useAgilePracticesStore();
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

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`/team/${activeTeam.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{activeTeam.name}</h1>
            <p className="text-muted-foreground">Suivi des pratiques agiles</p>
          </div>
        </div>
      </header>

      <AgilePractices teamId={activeTeam.id} />
    </div>
  );
};

export default TeamPractices;