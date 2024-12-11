import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { useResourceStore } from "../store/resourceStore";
import { toast } from "sonner";

export const ResourceManagement = () => {
  const { resources, addResource, updateResource, deleteResource } = useResourceStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleAddResource = () => {
    if (!newResource.firstName || !newResource.lastName) {
      toast.error("Le prénom et le nom sont requis");
      return;
    }

    addResource({
      id: Date.now().toString(),
      name: `${newResource.firstName} ${newResource.lastName}`,
      capacityPerDay: 1,
      firstName: newResource.firstName,
      lastName: newResource.lastName,
      email: newResource.email,
    });

    setNewResource({ firstName: "", lastName: "", email: "" });
    toast.success("Ressource ajoutée avec succès");
  };

  const handleDelete = (id: string) => {
    deleteResource(id);
    toast.success("Ressource supprimée");
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Input
            placeholder="Prénom"
            value={newResource.firstName}
            onChange={(e) => setNewResource(prev => ({ ...prev, firstName: e.target.value }))}
          />
          <Input
            placeholder="Nom"
            value={newResource.lastName}
            onChange={(e) => setNewResource(prev => ({ ...prev, lastName: e.target.value }))}
          />
          <Input
            type="email"
            placeholder="Email"
            value={newResource.email}
            onChange={(e) => setNewResource(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <Button onClick={handleAddResource}>Ajouter une ressource</Button>

        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">{resource.name}</p>
                <p className="text-sm text-gray-500">{resource.email}</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setEditingId(resource.id)}>
                  Modifier
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(resource.id)}>
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};