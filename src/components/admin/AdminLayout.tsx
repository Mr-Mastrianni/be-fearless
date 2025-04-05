import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  Dumbbell, 
  Database, 
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  // Navigation items for the admin sidebar
  const navItems = [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Data Management',
      href: '/admin/data',
      icon: <Database className="h-5 w-5" />,
    },
    {
      title: 'Activities',
      href: '/admin/activities',
      icon: <Dumbbell className="h-5 w-5" />,
    },
    {
      title: 'Statistics',
      href: '/admin/stats',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Helmet>
        <title>Admin | Courage Bot Adventure</title>
      </Helmet>
      
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 lg:block lg:w-64">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link to="/admin" className="flex items-center gap-2 font-semibold">
              <span className="text-primary">Courage Bot</span>
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Admin</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 py-2">
            <nav className="grid gap-1 px-2">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    location.pathname === item.href || location.pathname.startsWith(item.href + '/') 
                      ? "bg-accent text-accent-foreground" 
                      : "transparent"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.user_metadata?.full_name || 'Admin User'}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="flex flex-col w-full">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <span className="text-primary">Courage Bot</span>
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Admin</span>
          </Link>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* Mobile navigation */}
        <div className="lg:hidden border-t bg-background p-2">
          <nav className="grid grid-cols-3 gap-1">
            {navItems.slice(0, 3).map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md p-2 text-xs font-medium",
                  location.pathname === item.href || location.pathname.startsWith(item.href + '/') 
                    ? "bg-accent text-accent-foreground" 
                    : "transparent"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
