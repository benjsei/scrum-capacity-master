import { TeamManagement } from "@/components/TeamManagement";
import { TeamPodium } from "@/components/TeamPodium";
import { TeamVelocityChart } from "@/components/TeamVelocityChart";
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
import { Button } from "@/components/ui/button";
import { Download, Upload, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useSprintStore } from '../store/sprintStore';
import { useResourceStore } from '../store/resourceStore';
import { ResourceManagement } from "@/components/ResourceManagement";

const Index = () => {
  const { teams, setTeams } = useScrumTeamStore();
  const { sprints, setSprints } = useSprintStore();
  const { resources, setResources } = useResourceStore();
  const [showResourceManagement, setShowResourceManagement] = useState(false);

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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Paramètres
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowResourceManagement(true)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ressources
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <h1 className="text-3xl font-bold text-primary">Gestionnaire de Capacité Scrum</h1>
        <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
      </header>

      <Dialog open={showResourceManagement} onOpenChange={setShowResourceManagement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestion des ressources</DialogTitle>
          </DialogHeader>
          <ResourceManagement />
        </DialogContent>
      </Dialog>

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
      </div>
    </div>
  );
};

export default Index;