import { useState } from "react";
import { useManagerStore } from "../store/managerStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useScrumTeamStore } from "../store/scrumTeamStore";
import { useAgilePracticesStore } from "../store/agilePracticesStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ManagerManagement = () => {
  const [newManagerName, setNewManagerName] = useState("");
  const [managerToDelete, setManagerToDelete] = useState(null);
  const { managers, addManager } = useManagerStore();
  const { teams } = useScrumTeamStore();
  const { getPracticesForTeam } = useAgilePracticesStore();
  const navigate = useNavigate();

  const handleAddManager = () => {
    if (newManagerName.trim()) {
      addManager(newManagerName);
      setNewManagerName("");
    }
  };

  const getManagerProgress = (managerId: string) => {
    const managerTeams = teams.filter(team => team.managerId === managerId);
    if (managerTeams.length === 0) return 0;
    
    let totalProgress = 0;
    managerTeams.forEach(team => {
      const practices = getPracticesForTeam(team.id);
      if (practices.length > 0) {
        totalProgress += (practices.filter(p => p.isCompleted).length / practices.length);
      }
    });
    
    return Math.round((totalProgress / managerTeams.length) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Nom du manager"
          value={newManagerName}
          onChange={(e) => setNewManagerName(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddManager}>Ajouter</Button>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">Nom</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Progression</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {managers.map((manager) => (
                <tr
                  key={manager.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">{manager.name}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Progress value={getManagerProgress(manager.id)} className="w-[60%]" />
                      <span className="text-sm text-muted-foreground">
                        {getManagerProgress(manager.id)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teams/${manager.id}`)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Équipes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setManagerToDelete(manager)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!managerToDelete} onOpenChange={() => setManagerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le manager</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce manager ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // handle delete manager logic
                setManagerToDelete(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};