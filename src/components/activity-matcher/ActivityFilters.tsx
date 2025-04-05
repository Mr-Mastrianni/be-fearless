import React, { useState } from 'react';
import { useActivityMatcher } from '@/contexts/ActivityMatcherContext';
import { DifficultyLevel, FearCategory, TimeCommitment } from '@/models/ActivityTypes';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { SliderPicker } from '@/components/ui/slider-picker';
import { FilterIcon, RefreshCw, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const fearCategoryOptions: { value: FearCategory; label: string }[] = [
  { value: 'heights', label: 'Heights' },
  { value: 'water', label: 'Water' },
  { value: 'confined', label: 'Confined Spaces' },
  { value: 'social', label: 'Social Situations' },
];

const difficultyOptions: { value: DifficultyLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'challenging', label: 'Challenging' },
  { value: 'difficult', label: 'Difficult' },
];

const timeCommitmentOptions: { value: TimeCommitment; label: string }[] = [
  { value: 'under_1_hour', label: 'Under 1 hour' },
  { value: '1-3_hours', label: 'Up to 3 hours' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'full_day', label: 'Full Day' },
  { value: 'multi_day', label: 'Multiple Days' },
];

const environmentOptions = [
  { value: 'indoor', label: 'Indoor Only' },
  { value: 'outdoor', label: 'Outdoor Only' },
  { value: 'both', label: 'Indoor & Outdoor' },
];

interface ActivityFiltersProps {
  className?: string;
  viewType?: 'sidebar' | 'sheet';
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({ 
  className = '', 
  viewType = 'sidebar' 
}) => {
  const { 
    activeFilters,
    setActiveFilters,
    resetFilters,
    filteredActivities,
    matchedActivities
  } = useActivityMatcher();
  
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Handle fear category change
  const handleFearCategoryChange = (category: FearCategory, checked: boolean) => {
    if (checked) {
      setActiveFilters({
        fearCategories: [...activeFilters.fearCategories, category]
      });
    } else {
      setActiveFilters({
        fearCategories: activeFilters.fearCategories.filter(c => c !== category)
      });
    }
  };
  
  // Handle difficulty change
  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    setActiveFilters({ maxDifficulty: difficulty });
  };
  
  // Handle time commitment change
  const handleTimeCommitmentChange = (time: TimeCommitment) => {
    setActiveFilters({ maxTimeCommitment: time });
  };
  
  // Handle environment change
  const handleEnvironmentChange = (env: 'indoor' | 'outdoor' | 'both') => {
    setActiveFilters({ indoorOutdoor: env });
  };
  
  // Handle reset
  const handleReset = () => {
    resetFilters();
    
    if (viewType === 'sheet') {
      setSheetOpen(false);
    }
  };
  
  // Get active filter count
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (activeFilters.fearCategories.length > 0) count++;
    if (activeFilters.maxDifficulty) count++;
    if (activeFilters.maxTimeCommitment) count++;
    if (activeFilters.indoorOutdoor) count++;
    return count;
  };
  
  // Filter content
  const filterContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Filters</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 text-muted-foreground"
        >
          <RefreshCw size={14} className="mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Showing {filteredActivities.length} of {matchedActivities.length} activities
      </div>
      
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <Accordion type="multiple" defaultValue={['fear-categories', 'difficulty']}>
          {/* Fear Categories */}
          <AccordionItem value="fear-categories">
            <AccordionTrigger>Fear Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {fearCategoryOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`fear-${option.value}`}
                      checked={activeFilters.fearCategories.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleFearCategoryChange(option.value, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`fear-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Difficulty Level */}
          <AccordionItem value="difficulty">
            <AccordionTrigger>Difficulty Level</AccordionTrigger>
            <AccordionContent>
              <RadioGroup 
                value={activeFilters.maxDifficulty || ''} 
                onValueChange={(value) => handleDifficultyChange(value as DifficultyLevel)}
              >
                <div className="space-y-2">
                  {difficultyOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option.value} 
                        id={`difficulty-${option.value}`} 
                      />
                      <Label 
                        htmlFor={`difficulty-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
          
          {/* Time Commitment */}
          <AccordionItem value="time">
            <AccordionTrigger>Time Commitment</AccordionTrigger>
            <AccordionContent>
              <RadioGroup 
                value={activeFilters.maxTimeCommitment || ''} 
                onValueChange={(value) => handleTimeCommitmentChange(value as TimeCommitment)}
              >
                <div className="space-y-2">
                  {timeCommitmentOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option.value} 
                        id={`time-${option.value}`} 
                      />
                      <Label 
                        htmlFor={`time-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
          
          {/* Environment */}
          <AccordionItem value="environment">
            <AccordionTrigger>Environment</AccordionTrigger>
            <AccordionContent>
              <RadioGroup 
                value={activeFilters.indoorOutdoor || ''} 
                onValueChange={(value) => handleEnvironmentChange(value as 'indoor' | 'outdoor' | 'both')}
              >
                <div className="space-y-2">
                  {environmentOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem 
                        value={option.value} 
                        id={`env-${option.value}`} 
                      />
                      <Label 
                        htmlFor={`env-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
      
      {/* Mobile filter sheet footer */}
      {viewType === 'sheet' && (
        <div className="pt-4 mt-auto border-t">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleReset}
            >
              Reset Filters
            </Button>
            <Button 
              className="flex-1"
              onClick={() => setSheetOpen(false)}
            >
              Show Results ({filteredActivities.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render as sidebar
  if (viewType === 'sidebar') {
    return (
      <div className={className}>
        {filterContent}
      </div>
    );
  }
  
  // Render as mobile sheet
  return (
    <div className={className}>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FilterIcon size={14} />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:max-w-md flex flex-col">
          {filterContent}
        </SheetContent>
      </Sheet>
      
      {/* Display active filters */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {/* Fear Categories */}
          {activeFilters.fearCategories.map((category) => {
            const label = fearCategoryOptions.find(opt => opt.value === category)?.label || category;
            return (
              <Button
                key={`filter-${category}`}
                variant="secondary"
                size="sm"
                className="h-7 px-2 text-xs rounded-full bg-muted"
                onClick={() => handleFearCategoryChange(category, false)}
              >
                {label}
                <X size={14} className="ml-1" />
              </Button>
            );
          })}
          
          {/* Difficulty */}
          {activeFilters.maxDifficulty && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs rounded-full bg-muted"
              onClick={() => setActiveFilters({ maxDifficulty: null })}
            >
              {difficultyOptions.find(opt => opt.value === activeFilters.maxDifficulty)?.label || activeFilters.maxDifficulty}
              <X size={14} className="ml-1" />
            </Button>
          )}
          
          {/* Time Commitment */}
          {activeFilters.maxTimeCommitment && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs rounded-full bg-muted"
              onClick={() => setActiveFilters({ maxTimeCommitment: null })}
            >
              {timeCommitmentOptions.find(opt => opt.value === activeFilters.maxTimeCommitment)?.label || activeFilters.maxTimeCommitment}
              <X size={14} className="ml-1" />
            </Button>
          )}
          
          {/* Environment */}
          {activeFilters.indoorOutdoor && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs rounded-full bg-muted"
              onClick={() => setActiveFilters({ indoorOutdoor: null })}
            >
              {environmentOptions.find(opt => opt.value === activeFilters.indoorOutdoor)?.label || activeFilters.indoorOutdoor}
              <X size={14} className="ml-1" />
            </Button>
          )}
          
          {/* Clear All */}
          {getActiveFilterCount() > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleReset}
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFilters;
