 import { Bell, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/users': 'Users',
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = routeTitles[location.pathname] ?? 'OnIts';

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="h-full flex items-center justify-between px-6">

      {/* Page Title */}
      <h2 className="text-white font-semibold text-lg">{pageTitle}</h2>

      {/* Right Side */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Bell size={18} />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            0
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-800" />

        {/* User Info + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-sm font-medium leading-none">{user?.name ?? 'User'}</p>
              <p className="text-slate-500 text-xs mt-0.5">{user?.role ?? ''}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}