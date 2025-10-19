import { Moon, Sun, Bell, User, LogOut } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate(role === 'admin' ? '/admin/login' : '/carer/login');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg"
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo & Sidebar Trigger */}
        <div className="flex items-center gap-3">
          {(role === 'admin' || role === 'manager') && (
            <SidebarTrigger className="lg:flex" />
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">CareConnect</span>
              <span className="text-xs text-muted-foreground capitalize">{role || 'Portal'}</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-transform hover:scale-110"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="transition-transform hover:scale-110"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};
