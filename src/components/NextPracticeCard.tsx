import { Card } from "@/components/ui/card";
import { AlertCircle, Link as LinkIcon, User, Users, UserCheck, UserPlus, UsersRound, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { AgilePractice } from "@/types/agilePractice";

interface NextPracticeCardProps {
  practice: AgilePractice;
  teamId: string;
  onToggleCompletion: (teamId: string, practiceId: string) => void;
  onUpdateUrl: (teamId: string, practiceId: string, url: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const getWhoIcon = (who: string) => {
  switch (who.toUpperCase()) {
    case 'COLLECTIF':
      return <Users className="h-6 w-6" />;
    case 'SCRUM MASTER':
      return <UserCheck className="h-6 w-6" />;
    case 'PRODUCT OWNER':
      return <UserPlus className="h-6 w-6" />;
    case 'EQUIPE':
      return <UsersRound className="h-6 w-6" />;
    default:
      return <User className="h-6 w-6" />;
  }
};

const NextPracticeCard = ({ 
  practice, 
  teamId, 
  onToggleCompletion, 
  onUpdateUrl,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext 
}: NextPracticeCardProps) => {
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState('');

  const handleUrlSave = () => {
    if (editingUrl === practice.id) {
      onUpdateUrl(teamId, practice.id, urlValue);
      setEditingUrl(null);
      setUrlValue('');
    }
  };

  return (
    <Card className="p-6 border-2 border-primary">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-primary">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Prochaine pratique à réaliser</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!hasNext}
            className="h-8 w-8"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-start gap-4 flex-1">
            <Checkbox
              checked={practice.isCompleted}
              onCheckedChange={() => onToggleCompletion(teamId, practice.id)}
              className="mt-1"
            />
            <div className="space-y-2">
              <div className="font-medium text-lg">{practice.action}</div>
              {practice.subActions && (
                <div className="text-muted-foreground">{practice.subActions}</div>
              )}
              <div className="text-sm text-muted-foreground">
                Jour {practice.day}
                {practice.format && ` • ${practice.format}`}
                {practice.duration && ` • ${practice.duration}`}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            {getWhoIcon(practice.who)}
            <span className="text-sm font-medium text-muted-foreground text-center">{practice.who}</span>
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
                onClick={handleUrlSave}
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

        {practice.description && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {practice.description}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NextPracticeCard;