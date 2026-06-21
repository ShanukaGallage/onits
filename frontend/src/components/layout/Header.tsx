import { Bell, LogOut, Search } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/my-tasks':  'My Tasks',
  '/inbox':     'Inbox',
  '/profile':   'Profile',
  '/projects':  'Project Manage',
  '/users':     'User Manage',
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: notifications } = useNotifications();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const currentTab = searchParams.get('tab') || 'list';

  // Match /projects/:id too
  let pageTitle = routeTitles[location.pathname] ?? 'OnIts';
  if (location.pathname.startsWith('/projects/')) pageTitle = 'Project';

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/login'); }
  };

  return (
    <div className="h-full flex items-center justify-between px-6 font-jakarta">

      {/* Left side: Page title or custom navigation */}
      {location.pathname === '/my-tasks' ? (
        <nav className="flex items-center gap-6 h-full pt-4">
          <Link
            to="?tab=list"
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${currentTab === 'list' ? 'text-ip-primary border-ip-primary' : 'text-ip-on-surface-variant border-transparent hover:text-ip-primary'}`}
          >
            List
          </Link>
          <Link
            to="?tab=board"
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${currentTab === 'board' ? 'text-ip-primary border-ip-primary' : 'text-ip-on-surface-variant border-transparent hover:text-ip-primary'}`}
          >
            Board
          </Link>
          <Link
            to="?tab=calendar"
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${currentTab === 'calendar' ? 'text-ip-primary border-ip-primary' : 'text-ip-on-surface-variant border-transparent hover:text-ip-primary'}`}
          >
            Calendar
          </Link>
        </nav>
      ) : (
        <h2 className="text-ip-on-surface font-bold text-base">{pageTitle}</h2>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ip-outline" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 w-52 bg-ip-surface-container-low border border-ip-outline-variant rounded-ip-base text-sm text-ip-on-surface placeholder:text-ip-on-surface-variant/50 focus:outline-none focus:border-ip-primary focus:ring-1 focus:ring-ip-primary/30 transition-all duration-150"
          />
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/inbox')}
          className="relative w-9 h-9 rounded-ip-base flex items-center justify-center text-ip-on-surface-variant hover:bg-ip-surface-container-low hover:text-ip-on-surface transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-ip-error text-ip-on-error text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-ip-outline-variant mx-1" />

        {/* User */}
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-ip-on-primary text-sm font-semibold bg-gradient-to-br from-ip-primary to-ip-primary-container flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-ip-on-surface text-sm font-semibold leading-none">{user?.name ?? 'User'}</p>
            <p className="text-ip-on-surface-variant text-xs mt-0.5">{user?.role ?? ''}</p>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-ip-base flex items-center justify-center text-ip-on-surface-variant hover:bg-ip-error-container hover:text-ip-on-error-container transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}