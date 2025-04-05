import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import LinkWithRef from './LinkWithRef';
import { useTheme } from '@/contexts/ThemeContext';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarFallback = () => {
    if (!user) return 'CN';

    const name = user.user_metadata?.fullName || user.email || 'Anonymous';
    return getInitials(name);
  };

  const getAvatarImage = () => {
    return user?.user_metadata?.avatar_url || '';
  };

  // New color scheme
  const navBgClass = "bg-teal-800"; // Teal background
  const textClass = "text-white"; // White text
  const hoverClass = "hover:text-teal-200"; // Light teal on hover
  const activeBgClass = "bg-teal-700"; // Slightly lighter teal for active states
  const buttonBgClass = "bg-teal-600"; // Teal button
  const buttonHoverClass = "hover:bg-teal-500"; // Lighter teal on hover
  const mobileBgClass = "bg-teal-800"; // Match the navbar background for mobile menu

  return (
    <nav className={`fixed w-full z-50 ${navBgClass} shadow-md`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className={`font-bold text-xl ${textClass}`}>
                Be Courageous
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - hidden on small screens */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-6">
              <LinkWithRef
                href="/"
                className={`text-sm font-medium transition-colors ${hoverClass} ${textClass}`}
                text="Home"
              />
              <LinkWithRef
                href="/activities"
                className={`text-sm font-medium transition-colors ${hoverClass} ${textClass}`}
                text="Activity Explorer"
              />
              {user && (
                <LinkWithRef
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${hoverClass} ${textClass}`}
                  text="Dashboard"
                />
              )}
              {isAdmin && (
                <LinkWithRef
                  href="/admin"
                  className={`text-sm font-medium transition-colors ${hoverClass} ${textClass}`}
                  text="Admin"
                />
              )}
            </div>

            {/* User menu for desktop */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`relative h-8 w-8 rounded-full focus-visible:ring-0 ${textClass}`}>
                    <Avatar className="h-9 w-9 border-2 border-teal-300">
                      <AvatarImage src={getAvatarImage()} />
                      <AvatarFallback className="bg-teal-600 text-white">{getAvatarFallback()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.fullName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut();
                      navigate('/');
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Auth buttons for anonymous users
              <div className="flex items-center space-x-2">
                <LinkWithRef
                  href="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${textClass} hover:${textClass}/80`}
                  text="Sign in"
                />
                <LinkWithRef
                  href="/register"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${buttonBgClass} ${buttonHoverClass} backdrop-blur-sm ${textClass} border border-teal-300/20`}
                  text="Get Started"
                />
              </div>
            )}
          </div>

          {/* Mobile menu button - visible only on small screens */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - visible only when menu is open */}
      <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <div className={`px-4 pt-2 pb-4 space-y-2 ${mobileBgClass} border-t border-teal-700`}>
          <LinkWithRef
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-700 text-white"
            text="Home"
          />
          <LinkWithRef
            href="/activities"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-700 text-white"
            text="Activity Explorer"
          />
          {user && (
            <LinkWithRef
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-700 text-white"
              text="Dashboard"
            />
          )}
          {isAdmin && (
            <LinkWithRef
              href="/admin"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-700 text-white"
              text="Admin"
            />
          )}

          {user ? (
            <>
              <div className="px-3 py-2">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9 mr-3 border-2 border-teal-300">
                    <AvatarImage src={getAvatarImage()} />
                    <AvatarFallback className="bg-teal-600 text-white">{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-white">{user.user_metadata?.fullName || 'User'}</div>
                    <div className="text-xs text-teal-200">{user.email}</div>
                  </div>
                </div>
              </div>
              <LinkWithRef
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-700 text-white"
                text="Profile"
              />
              <button
                onClick={() => {
                  signOut();
                  navigate('/');
                  setIsOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-700 text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="px-3 py-2 space-y-2">
              <LinkWithRef
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-700 text-white w-full text-center"
                text="Sign in"
              />
              <LinkWithRef
                href="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-teal-600 hover:bg-teal-500 text-white w-full text-center"
                text="Get Started"
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
