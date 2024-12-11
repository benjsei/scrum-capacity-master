import { ResourceManagement } from "@/components/ResourceManagement";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Resources = () => {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Gestion des ressources</h1>
          <p className="text-muted-foreground">Gérez vos ressources ici</p>
        </div>
      </header>

      <ResourceManagement />
    </div>
  );
};

export default Resources;