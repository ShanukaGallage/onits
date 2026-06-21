import { NavLink } from 'react-router-dom';
import {
  Home, CheckSquare, Inbox, User,
  FolderCog, Users, FolderDot, Zap, ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

// ─── Nav item definition ──────────────────────────────────────────────────────
type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: number;
};

export default function Sidebar() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { data: notifications } = useNotifications();
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Home',            icon: Home },
    { to: '/my-tasks',  label: 'My Tasks',        icon: CheckSquare },
    { to: '/inbox',     label: 'Inbox',            icon: Inbox, badge: unreadCount },
    { to: '/profile',   label: 'Profile',          icon: User },
    { to: '/projects',  label: 'Project Manage',  icon: FolderCog,  roles: ['Admin', 'ProjectManager'] },
    { to: '/users',     label: 'User Manage',     icon: Users,      roles: ['Admin'] },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex flex-col h-full font-jakarta">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-ip-outline-variant flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-ip-base flex items-center justify-center bg-gradient-to-br from-ip-primary to-ip-primary-container shadow-[0_2px_8px_rgba(70,72,212,0.3)] flex-shrink-0">
            <Zap className="w-4 h-4 text-ip-on-primary" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-ip-on-surface font-bold text-base leading-none">OnIts</p>
            <p className="text-ip-on-surface-variant text-[11px] mt-0.5">Task Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">

        {visibleItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-ip-base text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-ip-secondary-container text-ip-on-surface font-semibold'
                  : 'text-ip-on-surface-variant hover:bg-ip-surface-container-low hover:text-ip-on-surface'
              }`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge != null && badge > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-ip-primary text-ip-on-primary text-[10px] font-bold flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* Divider + Projects section */}
        {projects && (
          <div className="pt-3 mt-1">
            <div className="border-t border-ip-outline-variant pt-3">
              <button
                onClick={() => setProjectsExpanded((v) => !v)}
                className="flex items-center justify-between w-full px-3 mb-1.5 group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-ip-on-surface-variant">
                  Active Projects
                </span>
                <ChevronDown
                  size={12}
                  className={`text-ip-on-surface-variant transition-transform duration-200 ${
                    projectsExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {projectsExpanded && (
                <div className="space-y-0.5">
                  {(() => {
                    const activeProjects = projects.filter(p => p.status === 'Planning' || p.status === 'InProgress');
                    if (activeProjects.length === 0) {
                      return <p className="px-3 py-1.5 text-[11px] text-ip-on-surface-variant italic">No active projects</p>;
                    }
                    return (
                      <>
                        {activeProjects.slice(0, 8).map((p) => (
                          <NavLink
                            key={p.id}
                            to={`/projects/${p.id}`}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-3 py-2 rounded-ip-base text-xs font-medium transition-all duration-150 truncate ${
                                isActive
                                  ? 'bg-ip-secondary-container text-ip-on-surface font-semibold'
                                  : 'text-ip-on-surface-variant hover:bg-ip-surface-container-low hover:text-ip-on-surface'
                              }`
                            }
                          >
                            <FolderDot size={13} className="flex-shrink-0 text-ip-primary" />
                            <span className="truncate">{p.name}</span>
                          </NavLink>
                        ))}
                        {activeProjects.length > 8 && (
                          <p className="px-3 py-1.5 text-[11px] text-ip-on-surface-variant">
                            +{activeProjects.length - 8} more projects…
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>


    </div>
  );
}