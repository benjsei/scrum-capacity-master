import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { useState } from "react";

interface DefaultPracticeCardProps {
  practice: any;
  onEdit: (practice: any) => void;
  onDelete: (id: string) => void;
}

export const DefaultPracticeCard = ({ practice, onEdit, onDelete }: DefaultPracticeCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    <>
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
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette pratique ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(practice.id);
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};