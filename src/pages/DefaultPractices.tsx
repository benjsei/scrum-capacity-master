import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DefaultPracticeForm } from "@/components/DefaultPracticeForm";
import { IndexHeader } from "@/components/IndexHeader";

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

    // Custom sort function for days (N, N+1, N+5, N+14)
    const sortedData = [...(data || [])].sort((a, b) => {
      const dayOrder = { "N": 0, "N+1": 1, "N+5": 2, "N+14": 3 };
      const dayA = dayOrder[a.day as keyof typeof dayOrder] ?? 4;
      const dayB = dayOrder[b.day as keyof typeof dayOrder] ?? 4;
      
      if (dayA !== dayB) return dayA - dayB;
      return a.action.localeCompare(b.action);
    });

    setPractices(sortedData);
  };

  useEffect(() => {
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
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      <IndexHeader />

      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle pratique
        </Button>
      </div>

      <div className="grid gap-4">
        {practices.map((practice) => (
          <Card key={practice.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="font-medium">{practice.action}</div>
                {practice.sub_actions && (
                  <div className="text-sm text-muted-foreground">
                    Sous-actions: {practice.sub_actions}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Jour {practice.day} • {practice.who} • {practice.type}
                </div>
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