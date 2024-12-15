import { SprintForm } from "@/components/SprintForm";
import { SprintList } from "@/components/SprintList";
import { VelocityChart } from "@/components/VelocityChart";
import { TeamVelocityChart } from "@/components/TeamVelocityChart";
import { CommitmentChart } from "@/components/CommitmentChart";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useSprintStore } from '../store/sprintStore';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { ResourceManagement } from "@/components/ResourceManagement";

const TeamDetails = () => {
  const { activeTeam } = useScrumTeamStore();
  const { canCreateNewSprint } = useSprintStore();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showResourceManagement, setShowResourceManagement] = useState(false);
  const navigate = useNavigate();
  const { teamId } = useParams();

  if (!activeTeam) {
    navigate('/');
    return null;
  }

  const handleBack = () => {
    // Navigate back to the manager's team list if managerId exists
    if (activeTeam.managerId) {
      navigate(`/teams/${activeTeam.managerId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Pratiques et Capacité Scrum</h1>
            <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowResourceManagement(true)}
        >
          <Users className="h-4 w-4 mr-2" />
          Ressources
        </Button>
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

        <div>
          <h2 className="text-xl font-semibold mb-4">Historique des sprints</h2>
          <SprintList />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VelocityChart />
          <CommitmentChart />
        </div>
      </div>

      <Dialog open={showResourceManagement} onOpenChange={setShowResourceManagement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestion des ressources</DialogTitle>
          </DialogHeader>
          <ResourceManagement />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamDetails;