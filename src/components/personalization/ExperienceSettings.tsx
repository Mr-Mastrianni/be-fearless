import React from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Slider
} from '@/components/ui/slider';
import { Compass, Settings2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ExperienceSettings = () => {
  const { preferences, updateExperiencePreferences } = useUserPreferences();
  const { user, getUserProfile } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [userFears, setUserFears] = React.useState<string[]>([]);
  const [focusAreas, setFocusAreas] = React.useState<string[]>(
    preferences.experiencePreferences.focus || ['general']
  );
  const [difficulty, setDifficulty] = React.useState(
    preferences.experiencePreferences.difficulty
  );
  const [pacing, setPacing] = React.useState(
    preferences.experiencePreferences.pacing
  );
  const [guidance, setGuidance] = React.useState(
    preferences.experiencePreferences.guidance
  );

  // Difficulty levels for experiences
  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner - Small first steps' },
    { value: 'intermediate', label: 'Intermediate - Balanced challenges' },
    { value: 'advanced', label: 'Advanced - Significant hurdles' },
    { value: 'expert', label: 'Expert - Maximum growth' },
  ];

  // Guidance levels
  const guidanceLevels = [
    { value: 'detailed', label: 'Detailed - Step-by-step instructions and support' },
    { value: 'balanced', label: 'Balanced - Some guidance, some self-direction' },
    { value: 'minimal', label: 'Minimal - Light guidance, mostly self-directed' },
  ];

  // Get user's fears from profile
  React.useEffect(() => {
    const loadUserFears = async () => {
      if (!user) return;

      try {
        const { data } = await getUserProfile();
        if (data && data.key_fears && data.key_fears.length > 0) {
          setUserFears(data.key_fears);
          
          // If user has fears but no focus areas set, default to their fears
          if (!preferences.experiencePreferences.focus || preferences.experiencePreferences.focus.length === 0) {
            setFocusAreas(data.key_fears);
          }
        }
      } catch (error) {
        console.error('Error loading user fears:', error);
      }
    };

    loadUserFears();
  }, [user, getUserProfile, preferences.experiencePreferences.focus]);

  const handleSave = async () => {
    await updateExperiencePreferences({
      difficulty: difficulty as any,
      focus: focusAreas,
      pacing: pacing as any,
      guidance: guidance as any,
    });
    setOpen(false);
  };

  const toggleFocusArea = (fear: string) => {
    if (focusAreas.includes(fear)) {
      setFocusAreas(focusAreas.filter((f) => f !== fear));
    } else {
      setFocusAreas([...focusAreas, fear]);
    }
  };

  const getPacingValue = () => {
    switch (pacing) {
      case 'slow':
        return [25];
      case 'moderate':
        return [50];
      case 'fast':
        return [75];
      default:
        return [50];
    }
  };

  const handlePacingChange = (value: number[]) => {
    const pacingValue = value[0];
    if (pacingValue <= 33) {
      setPacing('slow');
    } else if (pacingValue <= 66) {
      setPacing('moderate');
    } else {
      setPacing('fast');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 px-2 py-2 rounded-md hover:bg-accent"
          onClick={() => setOpen(true)}
        >
          <Compass className="h-[1.2rem] w-[1.2rem]" />
          <span className="flex-1 text-left">Experience Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Experience Settings</DialogTitle>
          <DialogDescription>
            Customize your experience settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="difficulty">
                <AccordionTrigger>Challenge Difficulty</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Choose how challenging your fear-conquering experiences should be.
                    </p>
                    <div className="grid gap-2">
                      {difficultyLevels.map((level) => (
                        <div
                          key={level.value}
                          className={`p-3 rounded-md border cursor-pointer transition-colors ${
                            difficulty === level.value
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-accent'
                          }`}
                          onClick={() => setDifficulty(level.value as any)}
                        >
                          <div className="font-medium">{level.label.split(' - ')[0]}</div>
                          <div className="text-sm text-muted-foreground">
                            {level.label.split(' - ')[1]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="focus">
                <AccordionTrigger>Focus Areas</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Select which fears you want to focus on. We'll prioritize experiences for these areas.
                    </p>
                    <div className="grid gap-2">
                      {userFears.length > 0 ? (
                        userFears.map((fear) => (
                          <div
                            key={fear}
                            className={`p-3 rounded-md border cursor-pointer transition-colors ${
                              focusAreas.includes(fear)
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-accent'
                            }`}
                            onClick={() => toggleFocusArea(fear)}
                          >
                            <div className="font-medium capitalize">{fear}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No fears found in your profile. Please update your profile first.
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          focusAreas.includes('general')
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => toggleFocusArea('general')}
                      >
                        <div className="font-medium">General Courage Building</div>
                        <div className="text-sm text-muted-foreground">
                          Non-specific activities to build overall courage
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pacing">
                <AccordionTrigger>Experience Pacing</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      How quickly should we introduce new challenges?
                    </p>
                    <div className="space-y-6">
                      <Slider 
                        value={getPacingValue()} 
                        onValueChange={handlePacingChange}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-sm">
                        <span className={pacing === 'slow' ? 'font-bold' : ''}>Slow</span>
                        <span className={pacing === 'moderate' ? 'font-bold' : ''}>Moderate</span>
                        <span className={pacing === 'fast' ? 'font-bold' : ''}>Fast</span>
                      </div>
                      <p className="text-sm italic">
                        {pacing === 'slow' && "Take your time, with longer periods between intensifying challenges."}
                        {pacing === 'moderate' && "Balanced progression that steadily builds your courage."}
                        {pacing === 'fast' && "Accelerated growth with quickly advancing challenges."}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="guidance">
                <AccordionTrigger>Guidance Level</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Choose how much guidance you want for your activities.
                    </p>
                    <div className="grid gap-2">
                      {guidanceLevels.map((level) => (
                        <div
                          key={level.value}
                          className={`p-3 rounded-md border cursor-pointer transition-colors ${
                            guidance === level.value
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-accent'
                          }`}
                          onClick={() => setGuidance(level.value as any)}
                        >
                          <div className="font-medium">{level.label.split(' - ')[0]}</div>
                          <div className="text-sm text-muted-foreground">
                            {level.label.split(' - ')[1]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceSettings;
