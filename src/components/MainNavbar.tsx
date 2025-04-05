import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Menu, X, Sun, Moon, User, Settings, LogOut, Activity, BarChart2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileData } from '@/contexts/AuthContext';

const MainNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  // Safely access auth context - handle potential errors
  const auth = useAuth();
  const user = auth?.user || null;
  const isAdmin = auth?.isAdmin || false;
  const signOut = auth?.signOut;

  // Safely access theme context
  const theme = useTheme();
  const currentMode = theme?.currentMode || 'light';
  const setTheme = theme?.setTheme;

  // Fetch user profile safely when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user && auth?.getUserProfile) {
          const { data } = await auth.getUserProfile();
          if (data) {
            setProfileData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    if (user) {
      fetchProfile();
    }
    
    // Debug log to confirm component is mounting
    console.log("MainNavbar component mounted");
  }, [user, auth]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
        navigate('/');
      }
    } catch (error) {
        console.error('Error signing out:', error);
    }
  };

  const toggleTheme = () => {
    if (setTheme) {
      setTheme({ mode: currentMode === 'dark' ? 'light' : 'dark' });
    }
  };

  // Component for menu items in navigation dropdown
  const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
  >(({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  });
  ListItem.displayName = "ListItem";

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!profileData?.full_name) return 'U';
    return profileData.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header 
      id="navbar-root"
      className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-300",
        isScrolled 
          ? "bg-red-500 dark:bg-red-600 shadow-md py-2" 
          : "bg-red-400/90 dark:bg-red-500/90 backdrop-blur-sm py-4"
      )}
      style={{
        display: 'block',
        visibility: 'visible',
        minHeight: '60px'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo width={36} height={36} />
            <span className="font-bold text-xl text-gray-900 dark:text-white">Be Courageous</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className={navigationMenuTriggerStyle()}>
                    Home
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <ListItem
                        title="Activities"
                        href="/activities"
                      >
                        Browse all activities designed to help you face your fears
                      </ListItem>
                      <ListItem
                        title="Video Gallery"
                        href="/#videos"
                      >
                        Watch stories of courage and transformation
                      </ListItem>
                      {user && (
                        <ListItem
                          title="Dashboard"
                          href="/dashboard"
                        >
                          Track your progress and journey
                        </ListItem>
                      )}
                      <ListItem
                        title="About"
                        href="/#about"
                      >
                        Learn about our mission and approach
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {isAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                        <ListItem
                          title="Dashboard"
                          href="/admin/dashboard"
                        >
                          Admin overview and system status
                        </ListItem>
                        <ListItem
                          title="User Management"
                          href="/admin/users"
                        >
                          Manage user accounts and permissions
                        </ListItem>
                        <ListItem
                          title="Activities"
                          href="/admin/activities"
                        >
                          Manage and create activities
                        </ListItem>
                        <ListItem
                          title="System Settings"
                          href="/admin/settings"
                        >
                          Configure system settings and preferences
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Switch to ${currentMode === 'dark' ? 'light' : 'dark'} mode`}
            >
              {currentMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth Buttons */}
            {!user ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="default">
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={profileData?.avatar_url || undefined} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer">
                      <Activity className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/dashboard" className="flex items-center cursor-pointer">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-500 dark:text-red-400 flex items-center cursor-pointer" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-900 dark:text-white" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg pb-4">
          <div className="container mx-auto px-4 pt-2 pb-3 space-y-3">
            <Link 
              to="/" 
              className="block py-2 px-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/activities" 
              className="block py-2 px-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Activities
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="block py-2 px-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {user && (
              <Link 
                to="/profile" 
                className="block py-2 px-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            {isAdmin && (
              <Link 
                to="/admin/dashboard" 
                className="block py-2 px-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={`Switch to ${currentMode === 'dark' ? 'light' : 'dark'} mode`}
              >
                {currentMode === 'dark' ? (
                  <div className="flex items-center">
                    <Sun size={18} />
                    <span className="ml-2">Light Mode</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Moon size={18} />
                    <span className="ml-2">Dark Mode</span>
                  </div>
                )}
              </button>
            </div>
            
            {user ? (
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            ) : (
              <div className="flex flex-col space-y-2 mt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNavbar;
