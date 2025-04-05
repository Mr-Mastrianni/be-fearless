import React from 'react';
import { Moon, Sun, Monitor, CheckCircle } from 'lucide-react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const handleModeChange = (mode: ThemeMode) => {
    setTheme({ mode: mode as ThemeMode });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 relative z-10 hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="z-[9999] mt-1">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuRadioGroup value={theme.mode} onValueChange={handleModeChange}>
          <DropdownMenuRadioItem value="light" className="cursor-pointer">
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
            {theme.mode === 'light' && <CheckCircle className="ml-auto h-4 w-4" />}
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="dark" className="cursor-pointer">
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
            {theme.mode === 'dark' && <CheckCircle className="ml-auto h-4 w-4" />}
          </DropdownMenuRadioItem>
          
          <DropdownMenuRadioItem value="system" className="cursor-pointer">
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
            {theme.mode === 'system' && <CheckCircle className="ml-auto h-4 w-4" />}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
