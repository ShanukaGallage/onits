import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',  icon: FolderKanban },
  { to: '/tasks',     label: 'Tasks',     icon: CheckSquare },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-60 h-screen bg-background border-r flex flex-col">
      <div className="px-6 py-5 border-b">
        <span className="text-xl font-bold tracking-tight">OnIts</span>
        <p className="text-xs text-muted-foreground mt-0.5">I'm on it!</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {user?.role === 'Admin' && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Users size={16} />
            Users
          </NavLink>
        )}
      </nav>

      <div className="px-4 py-4 border-t text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{user?.name}</p>
        <p>{user?.role}</p>
      </div>
    </aside>
  );
}