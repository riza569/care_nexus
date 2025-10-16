import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, Bell, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/store/themeStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, role, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-primary-foreground">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <User className="h-10 w-10" />
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold">
            {user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="mt-1 text-center text-sm opacity-90 capitalize">{role}</p>
        </motion.div>
      </div>

      {/* Profile Info */}
      <div className="p-4 space-y-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-gradient-card p-4 shadow-soft"
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-background/50 p-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium text-foreground capitalize">{role}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-card p-4 shadow-soft"
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">Settings</h2>
          <div className="space-y-3">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-lg bg-background/50 p-3 transition-colors hover:bg-background/70"
            >
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Current: {theme === 'dark' ? 'On' : 'Off'}
                  </p>
                </div>
              </div>
            </button>
            <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Notifications</p>
                  <p className="text-xs text-muted-foreground">Enabled</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
