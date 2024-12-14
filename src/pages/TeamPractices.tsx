import { useScrumTeamStore } from '../store/scrumTeamStore';
import { useAgilePracticesStore } from '../store/agilePracticesStore';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Percent, AlertCircle, Link as LinkIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import AgilePractices from "@/components/AgilePractices";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TeamPractices = () => {
  const { activeTeam } = useScrumTeamStore();
  const { initializePractices, getPracticesForTeam, togglePracticeCompletion, updatePracticeUrl } = useAgilePracticesStore();
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState('');

  useEffect(() => {
    if (activeTeam) {
      initializePractices(activeTeam.id);
    }
  }, [activeTeam, initializePractices]);

  useEffect(() => {
    if (activeTeam) {
      const practices = getPracticesForTeam(activeTeam.id);
      const dayOrder = ["N", "N + 1", "N + 5", "N + 14"];
      
      // Find days that are not 100% complete
      const incompleteDays = dayOrder.filter(day => {
        const dayPractices = practices.filter(p => p.day === day);
        return dayPractices.some(p => !p.isCompleted);
      });

      setExpandedDays(incompleteDays);
    }
  }, [activeTeam, getPracticesForTeam]);

  if (!activeTeam) {
    navigate('/');
    return null;
  }

  const practices = getPracticesForTeam(activeTeam.id);
  
  // Order days according to specification
  const dayOrder = ["N", "N + 1", "N + 5", "N + 14"];
  
  // Group practices by day
  const practicesByDay = dayOrder.reduce((acc, day) => {
    const dayPractices = practices.filter(practice => practice.day === day);
    if (dayPractices.length > 0) {
      acc[day] = dayPractices;
    }
    return acc;
  }, {} as Record<string, typeof practices>);

  const getDayProgress = (dayPractices) => {
    if (!dayPractices || dayPractices.length === 0) return 0;
    return Math.round(dayPractices.filter(p => p.isCompleted).length / dayPractices.length * 100);
  };

  const totalProgress = practices.length > 0 
    ? Math.round(practices.filter(p => p.isCompleted).length / practices.length * 100)
    : 0;

  // Find first incomplete practice
  const firstIncompletePractice = practices.find(p => !p.isCompleted);

  const handleUrlSave = () => {
    if (editingUrl && firstIncompletePractice) {
      updatePracticeUrl(activeTeam.id, firstIncompletePractice.id, urlValue);
      setEditingUrl(null);
      setUrlValue('');
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{activeTeam.name}</h1>
            <p className="text-muted-foreground">Suivi des pratiques agiles</p>
          </div>
        </div>
        <Card className="p-4 flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">{totalProgress}% complété</span>
        </Card>
      </header>

      {firstIncompletePractice && (
        <Card className="p-6 border-2 border-primary">
          <div className="flex items-center gap-2 text-primary mb-4">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Prochaine pratique à réaliser</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={firstIncompletePractice.isCompleted}
                onCheckedChange={() => togglePracticeCompletion(activeTeam.id, firstIncompletePractice.id)}
              />
              <div>
                <div className="font-medium">{firstIncompletePractice.action}</div>
                {firstIncompletePractice.subActions && (
                  <div className="text-muted-foreground">{firstIncompletePractice.subActions}</div>
                )}
                <div className="text-sm text-muted-foreground">
                  Jour {firstIncompletePractice.day} • {firstIncompletePractice.who}
                  {firstIncompletePractice.format && ` • ${firstIncompletePractice.format}`}
                  {firstIncompletePractice.duration && ` • ${firstIncompletePractice.duration}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              {editingUrl === firstIncompletePractice.id ? (
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
                  {firstIncompletePractice.url ? (
                    <a 
                      href={firstIncompletePractice.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline truncate"
                    >
                      {firstIncompletePractice.url}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">Aucune URL</span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingUrl(firstIncompletePractice.id);
                      setUrlValue(firstIncompletePractice.url || '');
                    }}
                  >
                    Modifier
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <Accordion 
        type="multiple" 
        className="space-y-8"
        value={expandedDays}
        onValueChange={setExpandedDays}
      >
        {Object.entries(practicesByDay).map(([day, dayPractices]) => (
          <AccordionItem key={day} value={day} className="border-none">
            <div className="flex items-center justify-between mb-4">
              <AccordionTrigger className="hover:no-underline">
                <h2 className="text-2xl font-bold">Jour {day}</h2>
              </AccordionTrigger>
              <Card className="p-2 flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <span className="font-medium">{getDayProgress(dayPractices)}%</span>
              </Card>
            </div>
            <AccordionContent>
              <AgilePractices teamId={activeTeam.id} dayFilter={day} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TeamPractices;