 import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',  icon: FolderKanban },
  { to: '/tasks',     label: 'Tasks',     icon: CheckSquare },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            O
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">OnIts</p>
            <p className="text-slate-500 text-xs mt-0.5">I'm on it!</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {/* Admin only */}
        {user?.role === 'Admin' && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Users size={16} />
            Users
          </NavLink>
        )}
      </nav>

      {/* User info bottom */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name ?? 'User'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.role ?? ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}