import { SprintForm } from "@/components/SprintForm";
import { SprintList } from "@/components/SprintList";
import { VelocityChart } from "@/components/VelocityChart";
import { TeamVelocityChart } from "@/components/TeamVelocityChart";
import { CommitmentChart } from "@/components/CommitmentChart";
import { TeamManagement } from "@/components/TeamManagement";
import { TeamPodium } from "@/components/TeamPodium";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useSprintStore } from '../store/sprintStore';
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Index = () => {
  const { activeTeam, teams } = useScrumTeamStore();
  const { canCreateNewSprint, sprints } = useSprintStore();
  const [showSprintForm, setShowSprintForm] = useState(false);

  const handleExport = () => {
    const data = {
      version: 1,
      teams,
      sprints,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scrum-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateImportData = (data: any) => {
    if (!data) throw new Error("Le fichier est vide ou mal formaté");
    if (typeof data !== 'object') throw new Error("Le fichier doit contenir un objet JSON");
    if (!data.version) throw new Error("La version du fichier est manquante");
    if (!Array.isArray(data.teams)) throw new Error("Le format des équipes est invalide");
    if (!Array.isArray(data.sprints)) throw new Error("Le format des sprints est invalide");
    
    // Validation plus détaillée des équipes
    data.teams.forEach((team: any, index: number) => {
      if (!team.id) throw new Error(`L'équipe à l'index ${index} n'a pas d'ID`);
      if (!team.name) throw new Error(`L'équipe à l'index ${index} n'a pas de nom`);
    });

    // Validation plus détaillée des sprints
    data.sprints.forEach((sprint: any, index: number) => {
      if (!sprint.id) throw new Error(`Le sprint à l'index ${index} n'a pas d'ID`);
      if (!sprint.teamId) throw new Error(`Le sprint à l'index ${index} n'a pas d'ID d'équipe`);
      if (!sprint.startDate) throw new Error(`Le sprint à l'index ${index} n'a pas de date de début`);
      if (!sprint.endDate) throw new Error(`Le sprint à l'index ${index} n'a pas de date de fin`);
      if (!Array.isArray(sprint.resources)) throw new Error(`Le sprint à l'index ${index} n'a pas de ressources valides`);
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error("Impossible de lire le fichier");
        }

        const data = JSON.parse(e.target.result as string);
        validateImportData(data);
        
        switch (data.version) {
          case 1:
            localStorage.setItem('teams', JSON.stringify(data.teams));
            localStorage.setItem('sprints', JSON.stringify(data.sprints));
            window.location.reload();
            break;
          default:
            throw new Error(`Version ${data.version} non supportée (seule la version 1 est supportée)`);
        }
      } catch (error) {
        console.error("Erreur détaillée:", error);
        toast.error("Erreur lors de l'import: " + (error as Error).message);
      }
    };

    reader.onerror = (error) => {
      console.error("Erreur de lecture du fichier:", error);
      toast.error("Erreur lors de la lecture du fichier");
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="text-center mb-8 relative">
        <div className="absolute right-0 top-0 flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Paramètres
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
                <label className="w-full">
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Importer
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <h1 className="text-3xl font-bold text-primary">Gestionnaire de Capacité Scrum</h1>
        <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
      </header>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Gestion des équipes</h2>
          <TeamManagement />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Podium des équipes</h2>
          <TeamPodium />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Comparaison des équipes</h2>
          <TeamVelocityChart />
        </div>

        {activeTeam ? (
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