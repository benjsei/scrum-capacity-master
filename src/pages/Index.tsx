import { SprintForm } from "@/components/SprintForm";
import { SprintList } from "@/components/SprintList";
import { VelocityChart } from "@/components/VelocityChart";
import { TeamVelocityChart } from "@/components/TeamVelocityChart";
import { CommitmentChart } from "@/components/CommitmentChart";
import { TeamManagement } from "@/components/TeamManagement";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useSprintStore } from '../store/sprintStore';
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Index = () => {
  const { activeTeam } = useScrumTeamStore();
  const { canCreateNewSprint } = useSprintStore();
  const [showSprintForm, setShowSprintForm] = useState(false);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Gestionnaire de Capacité Scrum</h1>
        <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
      </header>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Gestion des équipes</h2>
          <TeamManagement />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Comparaison des équipes</h2>
          <TeamVelocityChart />
        </div>

        {activeTeam && (
          <>
            <div className="space-y-4">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VelocityChart />
              <CommitmentChart />
            </div>
          </>
        ) : (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p>Veuillez sélectionner ou créer une équipe pour gérer les sprints</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;