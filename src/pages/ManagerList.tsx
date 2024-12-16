import { useEffect } from "react";
import { useManagerStore } from "../store/managerStore";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { useAgilePracticesStore } from "../store/agilePracticesStore";
import { useSprintStore } from "../store/sprintStore";
import { ManagerManagement } from "@/components/ManagerManagement";
import { ManagerProgressChart } from "@/components/ManagerProgressChart";
import { ManagerVelocityChart } from "@/components/ManagerVelocityChart";
import { ManagerCommitmentChart } from "@/components/ManagerCommitmentChart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileInput } from "lucide-react";
import { toast } from "sonner";
import { importData, importPractices } from "@/utils/dataImport";
import { parsePracticesCSV } from "@/utils/practicesImport";
import { useNavigate } from "react-router-dom";

const ManagerList = () => {
  const navigate = useNavigate();
  const { loadManagers } = useManagerStore();
  const { loadTeams, teams } = useScrumTeamStore();
  const { initializePractices } = useAgilePracticesStore();
  const { loadSprints } = useSprintStore();

  useEffect(() => {
    const initializeData = async () => {
      await loadManagers();
      // Load teams once and store the result
      const teams = await loadTeams();
      // Load sprints data
      await loadSprints();
      // Initialize practices for each team
      for (const team of teams) {
        await initializePractices(team.id);
      }
    };
    
    initializeData();
  }, [loadManagers, loadTeams, loadSprints, initializePractices]);

  const handleExport = () => {
    const data = {
      version: 1,
      teams,
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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.version || !Array.isArray(data.teams)) {
          throw new Error("Format de fichier invalide");
        }

        switch (data.version) {
          case 1:
            await importData(data);
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

  const handlePracticesImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const practices = await parsePracticesCSV(file);
      
      for (const team of teams) {
        await importPractices(team.id, practices);
      }
      
      toast.success(`${practices.length} pratiques importées avec succès pour ${teams.length} équipe(s) !`);
    } catch (error) {
      console.error("Error importing practices:", error);
      toast.error("Erreur lors de l'import des pratiques : " + (error as Error).message);
    }
    
    event.target.value = '';
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => navigate("/default-practices")}
                  >
                    <FileInput className="w-4 h-4 mr-2" />
                    Pratiques par défaut
                  </Button>
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
                  <label className="w-full">
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <span>
                        <FileInput className="w-4 h-4 mr-2" />
                        Importer pratiques (CSV)
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handlePracticesImport}
                    />
                  </label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <h1 className="text-3xl font-bold text-primary">Pratiques et Capacité Scrum</h1>
        <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
      </header>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestion des managers</h2>
        <ManagerManagement />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Progression des pratiques par manager</h2>
          <ManagerProgressChart />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Vélocité par manager</h2>
          <ManagerVelocityChart />
        </div>

        <div>
          <ManagerCommitmentChart />
        </div>
      </div>
    </div>
  );
};

export default ManagerList;
