import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { ListTodo, SparklesIcon, ArrowLeft } from 'lucide-react';
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
import type { Team } from '../types/scrumTeam';

interface TeamManagementProps {
  managerId: string | null;
}

export const TeamManagement = ({ managerId: propManagerId }: TeamManagementProps) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const { teams, addTeam, deleteTeam, setActiveTeam, updateTeamName } = useScrumTeamStore();
  const { getPracticesForTeam } = useAgilePracticesStore();
  const navigate = useNavigate();
  const { managerId: urlManagerId } = useParams();
  
  const effectiveManagerId = urlManagerId || propManagerId;

  const filteredTeams = effectiveManagerId 
    ? teams.filter(team => team.managerId === effectiveManagerId)
    : teams;

  const handleCreateTeam = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!newTeamName.trim()) {
      toast.error('Veuillez entrer un nom d\'équipe');
      return;
    }

    const newTeam = {
      id: Date.now().toString(),
      name: newTeamName.trim(),
      createdAt: new Date().toISOString(),
      resources: [],
      managerId: effectiveManagerId || undefined,
    };

    addTeam(newTeam);
    setNewTeamName('');
    toast.success('Équipe créée avec succès!');
  };

  const handleStartEditing = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditingName(currentName);
  };

  const handleSaveEdit = (teamId: string) => {
    if (!editingName.trim()) {
      toast.error('Le nom de l\'équipe ne peut pas être vide');
      return;
    }
    updateTeamName(teamId, editingName.trim());
    setEditingTeamId(null);
    toast.success('Nom de l\'équipe mis à jour avec succès!');
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    try {
      await deleteTeam(teamToDelete.id);
      toast.success('Équipe supprimée avec succès!');
      setTeamToDelete(null);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error("Erreur lors de la suppression de l'équipe");
    }
  };

  const getTeamProgress = (teamId: string) => {
    const practices = getPracticesForTeam(teamId);
    if (practices.length === 0) return 0;
    return Math.round((practices.filter(p => p.isCompleted).length / practices.length) * 100);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="teamName">Nouvelle équipe</Label>
              <form onSubmit={handleCreateTeam} className="flex gap-2">
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Nom de l'équipe"
                />
                <Button type="submit">Créer</Button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Équipes</h3>
              <div className="space-y-2">
                {filteredTeams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                    {editingTeamId === team.id ? (
                      <div className="flex gap-2 flex-1 mr-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Nouveau nom"
                        />
                        <Button onClick={() => handleSaveEdit(team.id)}>Enregistrer</Button>
                        <Button variant="outline" onClick={() => setEditingTeamId(null)}>Annuler</Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2 flex-grow">
                          <span>{team.name}</span>
                          <div className="w-full max-w-xs">
                            <Progress value={getTeamProgress(team.id)} className="h-2" />
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleNavigateToSprints(team)}
                          >
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Sprints
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleNavigateToPractices(team)}
                          >
                            <ListTodo className="w-4 h-4 mr-2" />
                            Pratiques
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStartEditing(team.id, team.name)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => setTeamToDelete(team)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!teamToDelete} onOpenChange={() => setTeamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'équipe</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
