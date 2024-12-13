import { SprintForm } from "@/components/SprintForm";
import { SprintList } from "@/components/SprintList";
import { VelocityChart } from "@/components/VelocityChart";
import { TeamVelocityChart } from "@/components/TeamVelocityChart";
import { CommitmentChart } from "@/components/CommitmentChart";
import { AgilePractices } from "@/components/AgilePractices";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useSprintStore } from '../store/sprintStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TeamDetails = () => {
  const { activeTeam } = useScrumTeamStore();
  const { canCreateNewSprint } = useSprintStore();
  const { initializePractices } = useAgilePracticesStore();
  const [showSprintForm, setShowSprintForm] = useState(false);
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
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{activeTeam.name}</h1>
            <p className="text-muted-foreground">Gestion des sprints et performances</p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {canCreateNewSprint() && !showSprintForm && (
          <Button 
            onClick={() => setShowSprintForm(true)}
            className="w-full"
          >
            Créer un nouveau sprint
          </Button>
        )}
        
        {showSprintForm && canCreateNewSprint() && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Créer un nouveau sprint pour {activeTeam.name}</h2>
            <SprintForm onComplete={() => setShowSprintForm(false)} />
          </div>
        )}

        <AgilePractices teamId={activeTeam.id} />

        <div>
          <h2 className="text-xl font-semibold mb-4">Historique des sprints</h2>
          <SprintList />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VelocityChart />
          <CommitmentChart />
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;