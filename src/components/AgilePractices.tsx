import { useState } from 'react';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from 'sonner';

interface AgilePracticesProps {
  teamId: string;
}

export const AgilePractices = ({ teamId }: AgilePracticesProps) => {
  const { getPracticesForTeam, togglePracticeCompletion, updatePracticeUrl } = useAgilePracticesStore();
  const [expandedTypes, setExpandedTypes] = useState<string[]>([]);
  const practices = getPracticesForTeam(teamId);

  const toggleExpanded = (type: string) => {
    setExpandedTypes(current =>
      current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
    );
  };

  const handleUrlUpdate = (practiceId: string, url: string) => {
    updatePracticeUrl(teamId, practiceId, url);
    toast.success('URL mise à jour');
  };

  const practicesByType = practices.reduce((acc, practice) => {
    if (!acc[practice.type]) {
      acc[practice.type] = [];
    }
    acc[practice.type].push(practice);
    return acc;
  }, {} as Record<string, typeof practices>);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Pratiques Agiles</h2>
      <div className="space-y-4">
        {Object.entries(practicesByType).map(([type, practices]) => (
          <Collapsible
            key={type}
            open={expandedTypes.includes(type)}
            onOpenChange={() => toggleExpanded(type)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex justify-between items-center p-2 bg-muted rounded-lg hover:bg-muted/80">
                <h3 className="text-lg font-semibold">{type}</h3>
                <span>{expandedTypes.includes(type) ? '▼' : '▶'}</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-4">
                {practices.map((practice) => (
                  <div key={practice.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id={`practice-${practice.id}`}
                        checked={practice.isCompleted}
                        onCheckedChange={() => togglePracticeCompletion(teamId, practice.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`practice-${practice.id}`} className="text-base font-medium">
                          {practice.action}
                        </Label>
                        {practice.subActions && (
                          <p className="text-sm text-muted-foreground mt-1">{practice.subActions}</p>
                        )}
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Qui:</span> {practice.who} |{' '}
                          <span className="font-medium">Format:</span> {practice.format}
                          {practice.duration && <> | <span className="font-medium">Durée:</span> {practice.duration}</>}
                        </div>
                        {practice.isCompleted && practice.completedAt && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Complété le: {new Date(practice.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label htmlFor={`url-${practice.id}`} className="text-sm">URL de référence</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={`url-${practice.id}`}
                          value={practice.url || ''}
                          onChange={(e) => handleUrlUpdate(practice.id, e.target.value)}
                          placeholder="Ajouter une URL"
                        />
                        {practice.url && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(practice.url, '_blank')}
                          >
                            Ouvrir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </Card>
  );
};