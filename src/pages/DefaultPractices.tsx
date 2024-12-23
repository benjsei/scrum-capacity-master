import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DefaultPracticeForm } from "@/components/DefaultPracticeForm";
import { IndexHeader } from "@/components/IndexHeader";
import { arrayMove } from '@dnd-kit/sortable';
import { DefaultPracticeList } from "@/components/DefaultPracticeList";

export const DefaultPractices = () => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<any[]>([]);
  const [editingPractice, setEditingPractice] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadPractices = async () => {
    const { data, error } = await supabase
      .from('default_practices')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error("Erreur lors du chargement des pratiques");
      return;
    }

    setPractices(data || []);
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

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = practices.findIndex((item) => item.id === active.id);
      const newIndex = practices.findIndex((item) => item.id === over.id);
      
      const newPractices = arrayMove(practices, oldIndex, newIndex);
      setPractices(newPractices);

      const updates = newPractices.map((practice, index) => ({
        id: practice.id,
        display_order: index,
        action: practice.action,
        day: practice.day,
        type: practice.type,
        who: practice.who,
        sub_actions: practice.sub_actions,
        format: practice.format,
        duration: practice.duration,
        description: practice.description
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('default_practices')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) {
          toast.error("Erreur lors de la mise à jour de l'ordre");
          loadPractices();
          return;
        }
      }

      toast.success("Ordre mis à jour avec succès");
    }
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

      <DefaultPracticeList
        practices={practices}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDragEnd={handleDragEnd}
      />

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