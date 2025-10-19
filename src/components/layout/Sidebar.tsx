import { NavLink, useLocation } from 'react-router-dom';
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
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

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
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;
  const isExpanded = adminMenuItems.some((item) => isActive(item.path));

  return (
    <SidebarUI collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.path}>
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarUI>
  );
};
