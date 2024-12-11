import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResourceStore } from '../store/resourceStore';
import { toast } from 'sonner';

export const ResourceManagement = () => {
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { resources, addResource } = useResourceStore();

  const handleStartEditing = (resourceId: string, currentName: string) => {
    setEditingResourceId(resourceId);
    setEditingName(currentName);
  };

  const handleSaveEdit = (resourceId: string) => {
    if (!editingName.trim()) {
      toast.error('Le nom de la ressource ne peut pas être vide');
      return;
    }
    
    // Mettre à jour le nom de la ressource
    const updatedResources = resources.map(resource => 
      resource.id === resourceId 
        ? { ...resource, name: editingName.trim() }
        : resource
    );
    
    // Mettre à jour le store avec la nouvelle liste
    addResource({ id: resourceId, name: editingName.trim(), capacityPerDay: 1 });
    setEditingResourceId(null);
    toast.success('Ressource mise à jour avec succès !');
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Ressources</h3>
          <div className="space-y-2">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
                {editingResourceId === resource.id ? (
                  <div className="flex gap-2 flex-1 mr-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Entrer un nouveau nom"
                    />
                    <Button onClick={() => handleSaveEdit(resource.id)}>Sauvegarder</Button>
                    <Button variant="outline" onClick={() => setEditingResourceId(null)}>Annuler</Button>
                  </div>
                ) : (
                  <>
                    <span>{resource.name}</span>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleStartEditing(resource.id, resource.name)}
                      >
                        Modifier
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
  );
};