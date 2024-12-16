import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DefaultPracticeForm } from "@/components/DefaultPracticeForm";

const DefaultPractices = () => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<any>(null);

  useEffect(() => {
    loadPractices();
  }, []);

  const loadPractices = async () => {
    const { data, error } = await supabase.from('default_practices').select('*');
    if (error) {
      toast.error("Erreur lors du chargement des pratiques");
      return;
    }
    setPractices(data || []);
  };

  const handleEditPractice = (practice: any) => {
    setSelectedPractice(practice);
    setIsEditing(true);
  };

  const handleDeletePractice = async (practiceId: string) => {
    const { error } = await supabase.from('default_practices').delete().eq('id', practiceId);
    if (error) {
      toast.error("Erreur lors de la suppression de la pratique");
      return;
    }
    toast.success("Pratique supprimée avec succès");
    loadPractices();
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="text-center mb-8 relative">
        <div className="absolute left-0 top-0">
          <Button variant="outline" size="icon" onClick={() => navigate('/managers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-primary">Pratiques et Capacité Scrum</h1>
        <p className="text-muted-foreground">Gérez la capacité de votre équipe et suivez la performance des sprints</p>
      </header>

      {isEditing && (
        <DefaultPracticeForm 
          practice={selectedPractice} 
          onClose={() => {
            setIsEditing(false);
            setSelectedPractice(null);
            loadPractices();
          }} 
        />
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle pratique
        </Button>
      </div>

      <div className="grid gap-4">
        {practices.map((practice) => (
          <div key={practice.id} className="p-4 border rounded-lg bg-card">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{practice.action}</h3>
                  {practice.sub_actions && (
                    <p className="text-sm text-muted-foreground">{practice.sub_actions}</p>
                  )}
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{practice.who}</span>
                    <span>•</span>
                    <span>{practice.type}</span>
                    {practice.format && (
                      <>
                        <span>•</span>
                        <span>{practice.format}</span>
                      </>
                    )}
                    {practice.duration && (
                      <>
                        <span>•</span>
                        <span>{practice.duration}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEditPractice(practice)}>
                    Modifier
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeletePractice(practice.id)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefaultPractices;