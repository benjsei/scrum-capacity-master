import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DefaultPracticeFormProps {
  practice?: any;
  onClose: () => void;
}

export const DefaultPracticeForm = ({ practice, onClose }: DefaultPracticeFormProps) => {
  const [formData, setFormData] = useState({
    day: practice?.day || "",
    who: practice?.who || "",
    type: practice?.type || "",
    action: practice?.action || "",
    sub_actions: practice?.sub_actions || "",
    format: practice?.format || "",
    duration: practice?.duration || "",
    description: practice?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (practice?.id) {
      const { error } = await supabase
        .from('default_practices')
        .update(formData)
        .eq('id', practice.id);

      if (error) {
        toast.error("Erreur lors de la mise à jour");
        return;
      }

      toast.success("Pratique mise à jour avec succès");
    } else {
      const { error } = await supabase
        .from('default_practices')
        .insert([formData]);

      if (error) {
        toast.error("Erreur lors de la création");
        return;
      }

      toast.success("Pratique créée avec succès");
    }

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {practice ? "Modifier la pratique" : "Nouvelle pratique"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">Jour</Label>
              <Input
                id="day"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="who">Qui</Label>
              <Select
                value={formData.who}
                onValueChange={(value) => setFormData({ ...formData, who: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLLECTIF">Collectif</SelectItem>
                  <SelectItem value="SCRUM MASTER">Scrum Master</SelectItem>
                  <SelectItem value="PRODUCT OWNER">Product Owner</SelectItem>
                  <SelectItem value="EQUIPE">Équipe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Input
                id="format"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Input
              id="action"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub_actions">Sous-actions</Label>
            <Input
              id="sub_actions"
              value={formData.sub_actions}
              onChange={(e) => setFormData({ ...formData, sub_actions: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};