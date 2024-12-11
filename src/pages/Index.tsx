import { SprintForm } from "@/components/SprintForm";
import { SprintList } from "@/components/SprintList";
import { VelocityChart } from "@/components/VelocityChart";
import { TeamVelocityChart } from "@/components/TeamVelocityChart";
import { CommitmentChart } from "@/components/CommitmentChart";
import { TeamManagement } from "@/components/TeamManagement";
import { TeamPodium } from "@/components/TeamPodium";
import { ResourceManagement } from "@/components/ResourceManagement";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useSprintStore } from '../store/sprintStore';
import { useResourceStore } from '../store/resourceStore';
import { Button } from "@/components/ui/button";
import { Download, Upload, Settings } from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Index = () => {
  const { activeTeam, teams, setTeams } = useScrumTeamStore();
  const { canCreateNewSprint, sprints, setSprints } = useSprintStore();
  const { resources, setResources } = useResourceStore();
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleExport = () => {
    const data = {
      version: 1,
      teams,
      sprints,
      resources,
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
    toast.success("Export réussi !");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.version || !Array.isArray(data.teams) || !Array.isArray(data.sprints)) {
          throw new Error("Format de fichier invalide");
        }

        switch (data.version) {
          case 1:
            setTeams(data.teams);
            setSprints(data.sprints);
            if (Array.isArray(data.resources)) {
              setResources(data.resources);
            }
            toast.success("Import réussi !");
            break;
          default:
            throw new Error("Version non supportée");
        }
      } catch (error) {
        toast.error("Erreur lors de l'import: " + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="text-center mb-8 relative">
        <div className="absolute right-0 top-0 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Import/Export
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

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Paramètres</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="teams">
            <TabsList>
              <TabsTrigger value="teams">Équipes</TabsTrigger>
              <TabsTrigger value="resources">Ressources</TabsTrigger>
            </TabsList>
            <TabsContent value="teams">
              <TeamManagement />
            </TabsContent>
            <TabsContent value="resources">
              <ResourceManagement />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
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