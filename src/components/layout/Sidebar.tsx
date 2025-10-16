import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  UserCheck,
  GraduationCap,
  Settings,
  FileText,
  MessageSquare,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Clients', path: '/admin/clients' },
  { icon: Calendar, label: 'Scheduling', path: '/admin/scheduling' },
  { icon: ClipboardList, label: 'My Actions', path: '/admin/actions' },
  { icon: UserCheck, label: 'Carers', path: '/admin/carers' },
  { icon: GraduationCap, label: 'Training', path: '/admin/training' },
  { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
  { icon: FileText, label: 'Reports', path: '/admin/reports' },
  { icon: DollarSign, label: 'Finance', path: '/admin/finance' },
  { icon: ShieldCheck, label: 'Policies', path: '/admin/policies' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const Sidebar = () => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="hidden h-[calc(100vh-4rem)] w-64 flex-col border-r border-border bg-card lg:flex"
    >
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {adminMenuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
};
