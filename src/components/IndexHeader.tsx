import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Download, Upload, Users, FileInput } from "lucide-react";
import { useState } from "react";
import { ResourceManagement } from "./ResourceManagement";
import { importData } from "@/utils/dataImport";
import { importPractices } from "@/utils/dataImport";
import { parsePracticesCSV } from "@/utils/practicesImport";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { toast } from "sonner";

export const IndexHeader = () => {
  const [showResourceManagement, setShowResourceManagement] = useState(false);
  const { teams } = useScrumTeamStore();

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
      <h1 className="text-3xl font-bold text-primary">Pratiques et Capacité Scrum</h1>
      <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>

      <Dialog open={showResourceManagement} onOpenChange={setShowResourceManagement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestion des ressources</DialogTitle>
          </DialogHeader>
          <ResourceManagement />
        </DialogContent>
      </Dialog>
    </header>
  );
};