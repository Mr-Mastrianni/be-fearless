import React from 'react';
import { useUserPreferences, DashboardLayout } from '@/contexts/UserPreferencesContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LayoutDashboard, Eye, EyeOff, Grid, List, Check, HeartHandshake } from 'lucide-react';

type WidgetType = 'activity' | 'progress' | 'journal' | 'recommended' | 'personalized' | 'journey';

const DashboardPreferences = () => {
  const { dashboardLayout, updateDashboardLayout, resetPreferences } = useUserPreferences();
  const [localLayout, setLocalLayout] = React.useState<DashboardLayout>(dashboardLayout);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setLocalLayout(dashboardLayout);
  }, [dashboardLayout]);

  const toggleWidgetVisibility = (widgetKey: WidgetType) => {
    const updatedWidgets = {
      ...localLayout.widgets,
      [widgetKey]: {
        ...localLayout.widgets[widgetKey],
        visible: !localLayout.widgets[widgetKey].visible
      }
    };
    
    setLocalLayout({
      ...localLayout,
      widgets: updatedWidgets
    });
  };

  const handleSizeChange = (widgetKey: WidgetType, size: 'small' | 'medium' | 'large') => {
    const updatedWidgets = {
      ...localLayout.widgets,
      [widgetKey]: {
        ...localLayout.widgets[widgetKey],
        size
      }
    };
    
    setLocalLayout({
      ...localLayout,
      widgets: updatedWidgets
    });
  };

  const setViewMode = (viewMode: 'grid' | 'list') => {
    setLocalLayout({
      ...localLayout,
      viewMode
    });
  };

  const saveChanges = async () => {
    await updateDashboardLayout(localLayout);
    setOpen(false);
  };

  const handleReset = async () => {
    await resetPreferences();
    setOpen(false);
  };

  const getWidgetName = (id: WidgetType) => {
    switch (id) {
      case 'progress':
        return 'Progress Charts';
      case 'activity':
        return 'Activity Tracker';
      case 'journal':
        return 'Journal Entries';
      case 'recommended':
        return 'Recommended Activities';
      case 'personalized':
        return 'Personalized Recommendations';
      case 'journey':
        return 'My Journey';
      default:
        return id;
    }
  };

  const widgetKeys = localLayout?.widgets ? 
    Object.keys(localLayout.widgets) as WidgetType[] : 
    [];
  
  // Sort widgets by position
  const sortedWidgetKeys = [...widgetKeys].sort((a, b) => 
    localLayout?.widgets?.[a]?.position - localLayout?.widgets?.[b]?.position || 0
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 px-2 py-2 rounded-md hover:bg-accent"
          onClick={() => setOpen(true)}
        >
          <LayoutDashboard className="h-[1.2rem] w-[1.2rem]" />
          <span className="flex-1 text-left">Customize Dashboard</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle>Dashboard Preferences</SheetTitle>
          <SheetDescription>
            Customize your dashboard layout and widgets.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Layout View</h3>
            <div className="flex gap-2">
              <Button
                variant={localLayout.viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
                Grid
                {localLayout.viewMode === 'grid' && <Check className="h-3 w-3 ml-1" />}
              </Button>
              <Button
                variant={localLayout.viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
                List
                {localLayout.viewMode === 'list' && <Check className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Widget Visibility & Size</h3>
            <div className="space-y-3">
              {sortedWidgetKeys.map((widgetKey) => {
                const widget = localLayout.widgets[widgetKey];
                return (
                  <div 
                    key={widgetKey} 
                    className={`p-3 rounded-md border ${
                      widget.visible
                        ? 'bg-card'
                        : 'bg-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium">
                          {getWidgetName(widgetKey)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleWidgetVisibility(widgetKey)}
                          title={widget.visible ? 'Hide' : 'Show'}
                        >
                          {widget.visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {widget.visible && (
                      <div className="mt-2 pl-2">
                        <div className="flex items-center gap-4">
                          <Label htmlFor={`${widgetKey}-size`} className="w-14">
                            Size:
                          </Label>
                          <Select
                            value={widget.size}
                            onValueChange={(value) =>
                              handleSizeChange(
                                widgetKey,
                                value as 'small' | 'medium' | 'large'
                              )
                            }
                            id={`${widgetKey}-size-select`}
                            name={`${widgetKey}-size`}
                          >
                            <SelectTrigger id={`${widgetKey}-size`} className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={saveChanges}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardPreferences;
