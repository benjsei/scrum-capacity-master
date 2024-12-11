import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useResourceStore } from "../store/resourceStore";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const ResourceManagement = () => {
  const { resources, updateResource, deleteResource } = useResourceStore();

  const handleUpdateResource = (id: string, name: string) => {
    if (name.trim()) {
      updateResource(id, { name: name.trim() });
      toast.success("Ressource mise à jour");
    }
  };

  const handleDeleteResource = (id: string) => {
    deleteResource(id);
    toast.success("Ressource supprimée");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center gap-2">
            <Input
              defaultValue={resource.name}
              onBlur={(e) => handleUpdateResource(resource.id, e.target.value)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteResource(resource.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {resources.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune ressource</p>
        )}
      </div>
    </div>
  );
};