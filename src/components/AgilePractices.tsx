import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Card } from "@/components/ui/card";
import { User, Users, UserCheck, UserPlus, UsersRound, Link as LinkIcon, Plus, Minus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AgilePracticesProps {
  teamId: string;
  dayFilter?: string;
}

const getWhoIcon = (who: string) => {
  switch (who.toUpperCase()) {
    case 'COLLECTIF':
      return <Users className="h-4 w-4" />;
    case 'SCRUM MASTER':
      return <UserCheck className="h-4 w-4" />;
    case 'PRODUCT OWNER':
      return <UserPlus className="h-4 w-4" />;
    case 'EQUIPE':
      return <UsersRound className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const AgilePractices = ({ teamId, dayFilter }: AgilePracticesProps) => {
  const { teamPractices, initializePractices, togglePracticeCompletion, updatePracticeUrl } = useAgilePracticesStore();
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState('');
  const [expandedPractices, setExpandedPractices] = useState<string[]>([]);
  
  useEffect(() => {
    if (teamId) {
      initializePractices(teamId);
    }
  }, [teamId, initializePractices]);
  
  const teamPractice = teamPractices.find(tp => tp.teamId === teamId);
  
  if (!teamPractice || !teamPractice.practices) {
    return <div className="text-center text-muted-foreground">Chargement des pratiques...</div>;
  }

  const filteredPractices = dayFilter 
    ? teamPractice.practices.filter(p => p.day === dayFilter)
    : teamPractice.practices;

  if (filteredPractices.length === 0) {
    return <div className="text-center text-muted-foreground">Aucune pratique pour ce jour</div>;
  }

  const practicesByType = filteredPractices.reduce((acc, practice) => {
    if (!acc[practice.type]) {
      acc[practice.type] = [];
    }
    acc[practice.type].push(practice);
    return acc;
  }, {} as Record<string, typeof filteredPractices>);

  const handleUrlSave = (practiceId: string) => {
    if (editingUrl === practiceId) {
      updatePracticeUrl(teamId, practiceId, urlValue);
      setEditingUrl(null);
      setUrlValue('');
    }
  };

  const togglePracticeDetails = (practiceId: string) => {
    setExpandedPractices(prev => 
      prev.includes(practiceId) 
        ? prev.filter(id => id !== practiceId)
        : [...prev, practiceId]
    );
  };

  const isFirstIncompletePractice = (practice, practices) => {
    const firstIncomplete = practices.find(p => !p.isCompleted);
    return firstIncomplete && firstIncomplete.id === practice.id;
  };

  return (
    <div className="space-y-8">
      {Object.entries(practicesByType).map(([type, practices]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{type}</h3>
          <div className="space-y-4">
            {practices.map((practice) => {
              const isHighlighted = isFirstIncompletePractice(practice, filteredPractices);
              const isExpanded = isHighlighted || expandedPractices.includes(practice.id);

              return (
                <Card key={practice.id} className={`p-4 ${isHighlighted ? 'border-2 border-primary' : ''}`}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        id={`practice-${practice.id}`}
                        checked={practice.isCompleted}
                        onCheckedChange={() => togglePracticeCompletion(teamId, practice.id)}
                      />
                      <div className="flex items-center gap-2">
                        {getWhoIcon(practice.who)}
                        <span className="text-sm font-medium text-muted-foreground">{practice.who}</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{practice.action}</span>
                          {!isHighlighted && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePracticeDetails(practice.id)}
                              className="ml-2"
                            >
                              {isExpanded ? (
                                <Minus className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        {isExpanded && (
                          <>
                            {practice.subActions && (
                              <span className="text-sm text-muted-foreground">{practice.subActions}</span>
                            )}
                            {practice.description && (
                              <div className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                                {practice.description}
                              </div>
                            )}
                            {practice.format && practice.duration && (
                              <span className="text-sm text-muted-foreground">
                                {practice.format} • {practice.duration}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      {editingUrl === practice.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder="Entrez l'URL..."
                            className="flex-1"
                          />
                          <Button 
                            size="sm"
                            onClick={() => handleUrlSave(practice.id)}
                          >
                            Sauvegarder
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUrl(null);
                              setUrlValue('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          {practice.url ? (
                            <a 
                              href={practice.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline truncate"
                            >
                              {practice.url}
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground">Aucune URL</span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingUrl(practice.id);
                              setUrlValue(practice.url || '');
                            }}
                          >
                            Modifier
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgilePractices;