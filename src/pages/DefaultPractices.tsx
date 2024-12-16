import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DefaultPracticeForm } from "@/components/DefaultPracticeForm";

export const DefaultPractices = () => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<any[]>([]);
  const [editingPractice, setEditingPractice] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadPractices = async () => {
    const { data, error } = await supabase
      .from('default_practices')
      .select('*')
      .order('day', { ascending: true });

    if (error) {
      toast.error("Erreur lors du chargement des pratiques");
      return;
    }

    setPractices(data || []);
  };

  useState(() => {
    loadPractices();
  }, []);

  const handleEdit = (practice: any) => {
    setEditingPractice(practice);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('default_practices')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    toast.success("Pratique supprimée avec succès");
    loadPractices();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPractice(null);
    loadPractices();
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle pratique
        </Button>
      </div>

      <h1 className="text-3xl font-bold text-primary">Pratiques par défaut</h1>

      <div className="grid gap-4">
        {practices.map((practice) => (
          <Card key={practice.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="font-medium">{practice.action}</div>
                <div className="text-sm text-muted-foreground">
                  Jour {practice.day} • {practice.who} • {practice.type}
                </div>
                {practice.description && (
                  <div className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                    {practice.description}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(practice)}>
                  Modifier
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(practice.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {isFormOpen && (
        <DefaultPracticeForm
          practice={editingPractice}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default DefaultPractices;