import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DefaultPracticeForm } from "@/components/DefaultPracticeForm";
import { IndexHeader } from "@/components/IndexHeader";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortablePracticeCard = ({ practice, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: practice.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <button {...attributes} {...listeners} className="mt-1 cursor-grab hover:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </button>
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
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(practice)}>
            Modifier
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(practice.id)}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const DefaultPractices = () => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<any[]>([]);
  const [editingPractice, setEditingPractice] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = practices.findIndex((item) => item.id === active.id);
      const newIndex = practices.findIndex((item) => item.id === over.id);
      
      const newPractices = arrayMove(practices, oldIndex, newIndex);
      setPractices(newPractices);

      // Mettre à jour l'ordre dans la base de données
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
          loadPractices(); // Recharger l'ordre original en cas d'erreur
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={practices.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4">
            {practices.map((practice) => (
              <SortablePracticeCard
                key={practice.id}
                practice={practice}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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