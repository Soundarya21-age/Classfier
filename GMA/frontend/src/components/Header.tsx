import { User, Settings, LogOut, HelpCircle, Sun, Moon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useTheme } from './ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

export function Header({ onLogout, onNavigate }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();

  // ✅ FIXED: Safely get user display name
  const userDisplayName = 
    currentUser?.displayName || 
    (currentUser?.email ? currentUser.email.split('@')[0] : 'User');

  const userEmail = currentUser?.email || 'user@example.com';

  // ✅ FIXED: Check if userDisplayName is a string before calling split
  const userInitials = 
    typeof userDisplayName === 'string'
      ? userDisplayName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';

  return (
    <header className="dark:bg-[#1A1F25]/80 bg-white/80 backdrop-blur-lg border-b dark:border-gray-800 border-gray-200 sticky top-0 z-50">
      <div className="px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#00D9FF] to-[#0099FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#00D9FF]/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="dark:text-white text-gray-900 text-xl">GMA Classifier</h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="icon"
              className="rounded-xl dark:border-gray-700 border-gray-300 bg-transparent dark:hover:bg-gray-800 hover:bg-gray-100 transition-all duration-200"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none focus:ring-2 focus:ring-[#00D9FF] focus:ring-offset-2 dark:focus:ring-offset-[#1A1F25] focus:ring-offset-white rounded-full">
                <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-transparent hover:ring-[#00D9FF]/40 transition-all duration-200">
                  {currentUser?.photoURL && (
                    <AvatarImage src={currentUser.photoURL} alt={userDisplayName} />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-[#00D9FF] to-[#0099FF] text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 dark:bg-[#1F2937] bg-white dark:border-gray-700 border-gray-200">
                <DropdownMenuLabel className="dark:text-white text-gray-900">
                  <p className="text-sm">{userDisplayName}</p>
                  <p className="dark:text-gray-400 text-gray-600 text-xs">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-gray-700 bg-gray-200" />
                <DropdownMenuItem
                  onClick={() => onNavigate('profile')}
                  className="dark:text-gray-300 text-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 cursor-pointer dark:focus:bg-gray-800 focus:bg-gray-100 dark:focus:text-white focus:text-gray-900"
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onNavigate('settings')}
                  className="dark:text-gray-300 text-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 cursor-pointer dark:focus:bg-gray-800 focus:bg-gray-100 dark:focus:text-white focus:text-gray-900"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onNavigate('help')}
                  className="dark:text-gray-300 text-gray-700 dark:hover:bg-gray-800 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 cursor-pointer dark:focus:bg-gray-800 focus:bg-gray-100 dark:focus:text-white focus:text-gray-900"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-700 bg-gray-200" />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer focus:bg-red-500/10 focus:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
