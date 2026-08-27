import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Inbox,
  CheckSquare,
  FolderCog,
  User,
  FolderDot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

export type NavItemData = {
  id: string; // Used as the route path
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
  roles?: string[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

function WorkspaceSwitcher({ selected, onSelect, user }: { selected?: string, onSelect?: (ws: string) => void, user: { name?: string; role?: string; avatarUrl?: string } | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const internalSelected = 'OnIts Workspace';
  const current = selected || internalSelected;
  const handleSelect = onSelect || (() => {});

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-2 mb-4 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-primary text-primary-foreground flex items-center justify-center font-semibold text-[13px] shadow-sm">
            {current.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-medium leading-none mb-1 text-foreground truncate max-w-[120px]">{current}</span>
            <span className="text-[11px] text-muted-foreground leading-none">{user?.role || 'User'} Plan</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground/70 transition-colors shrink-0" strokeWidth={1.5} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[52px] left-0 w-full bg-card border border-border/50 rounded-lg shadow-xl z-50 py-1 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100">
            {['OnIts Workspace', 'Personal Workspace'].map(ws => (
              <div 
                key={ws}
                onClick={() => { handleSelect(ws); setIsOpen(false); }}
                className={`px-3 py-2 mx-1 text-[13px] rounded-md cursor-pointer transition-colors ${current === ws ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                {ws}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NavItem({ 
  item, 
  activeId, 
  onSelect,
  level = 0
}: { 
  item: NavItemData; 
  activeId: string; 
  onSelect: (id: string) => void;
  level?: number;
}) {
  const isActive = activeId === item.id || (activeId.startsWith(item.id) && item.id !== '/');
  const hasChildren = !!item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(isActive || level === 0);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasChildren && item.id === '#') {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id);
      if (hasChildren) setIsOpen(true);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none
          ${isActive && !hasChildren
            ? 'bg-black/5 dark:bg-white/10 text-foreground font-medium' 
            : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground/90'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon 
            className={`w-[16px] h-[16px] transition-colors
              ${isActive && !hasChildren ? 'text-foreground' : 'text-muted-foreground/70 group-hover:text-foreground/70'}
            `} 
            strokeWidth={1.5} 
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {item.shortcut && (
             <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-muted-foreground/60 bg-background/50 border border-border/50 rounded-[4px] shadow-xs">
               {item.shortcut}
             </kbd>
          )}
          {item.badge != null && Number(item.badge) > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
              {Number(item.badge) > 99 ? '99+' : item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight 
              onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
              className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div 
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div 
              className="absolute top-0 bottom-0 border-l border-black/5 dark:border-white/5"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map(child => (
              <NavItem 
                key={child.id} 
                item={child} 
                activeId={activeId} 
                onSelect={onSelect} 
                level={level + 1} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ className = '' }: { className?: string }) {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { data: notifications } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const activeProjects = projects?.filter(p => p.status === 'Planning' || p.status === 'InProgress') || [];

  const navGroups: NavGroupData[] = [
    {
      items: [
        { id: '/dashboard', title: 'Home', icon: LayoutDashboard },
        { id: '/my-tasks', title: 'My Tasks', icon: CheckSquare },
        { id: '/inbox', title: 'Inbox', icon: Inbox, badge: unreadCount },
      ]
    },
    {
      heading: 'Workspace',
      items: [
        { 
          id: '#', 
          title: 'Projects', 
          icon: FolderKanban,
          children: activeProjects.map(p => ({
            id: `/projects/${p.id}`,
            title: p.name,
            icon: FolderDot
          }))
        },
      ]
    },
    {
      heading: 'Administration',
      items: [
        { id: '/projects', title: 'Manage Projects', icon: FolderCog, roles: ['Admin', 'ProjectManager'] },
        { id: '/users', title: 'Manage Users', icon: Users, roles: ['Admin'] },
      ]
    }
  ];

  const bottomItems: NavItemData[] = [
    { id: '/profile', title: 'Profile', icon: User },
    // Settings or LogOut could go here if implemented in frontend app routing
  ];

  // Filter items based on user roles
  const filterByRole = (items: NavItemData[]): NavItemData[] => {
    return items.filter(item => {
      if (item.roles && user && !item.roles.includes(user.role)) return false;
      if (item.children) {
        item.children = filterByRole(item.children);
      }
      return true;
    });
  };

  const visibleGroups = navGroups.map(group => ({
    ...group,
    items: filterByRole(group.items)
  })).filter(group => group.items.length > 0);

  const visibleBottom = filterByRole(bottomItems);

  const handleSelect = (id: string) => {
    if (id !== '#') {
      navigate(id);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-card/50 border-r border-border/50 p-3 font-sans w-[260px] shrink-0 ${className}`}>
      <WorkspaceSwitcher user={user} />

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
        {visibleGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="px-2.5 mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase">
                {group.heading}
              </span>
            )}
            {group.items.map(item => (
              <NavItem 
                key={item.id} 
                item={item} 
                activeId={location.pathname} 
                onSelect={handleSelect} 
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-0.5">
        {visibleBottom.map(item => (
          <NavItem 
            key={item.id} 
            item={item} 
            activeId={location.pathname} 
            onSelect={handleSelect} 
          />
        ))}
      </div>
    </div>
  );
}