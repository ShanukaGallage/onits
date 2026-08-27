import { useState, useEffect } from 'react';
import { Bell, LogOut, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useRealtimeNotifications } from '@/features/notifications/hooks/useRealtimeNotifications';



export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: notifications } = useNotifications();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // Default to dark mode
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    }
    return 'dark';
  });

  useRealtimeNotifications();

  // Apply theme to HTML root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const currentTab = searchParams.get('tab') || 'list';

  // Match /projects/:id too
  
  

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/login'); }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = e.currentTarget.value.trim();
      const isTaskPage = location.pathname === '/my-tasks' || location.pathname.startsWith('/projects/');
      
      if (!isTaskPage) {
        navigate(q ? `/my-tasks?q=${encodeURIComponent(q)}` : '/my-tasks');
      } else {
        if (q) {
          searchParams.set('q', q);
        } else {
          searchParams.delete('q');
        }
        navigate(`${location.pathname}?${searchParams.toString()}`);
      }
    }
  };

  return (
    <div className="h-full flex items-center justify-between px-6 font-jakarta">

      {/* Left side: Page title or custom navigation */}
      {location.pathname === '/my-tasks' ? (
        <div className="flex items-center justify-between flex-1 mr-6">
          <nav className="flex items-center gap-6 h-full pt-4">
            <Link
              to="?tab=list"
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${currentTab === 'list' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-primary'}`}
            >
              List
            </Link>
            <Link
              to="?tab=board"
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${currentTab === 'board' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-primary'}`}
            >
              Board
            </Link>
            <Link
              to="?tab=calendar"
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${currentTab === 'calendar' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-primary'}`}
            >
              Calendar
            </Link>
          </nav>
          
          <div className="flex items-center gap-2 mt-2">
            <button className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold bg-muted px-2 py-1 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filter
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold bg-muted px-2 py-1 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
              Sort
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            defaultValue={searchParams.get('q') || ''}
            onKeyDown={handleSearch}
            placeholder="Search tasks..."
            className="pl-9 pr-4 py-1.5 w-52 bg-muted/50 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-150"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/inbox')}
          className="relative w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* User */}
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Avatar className="w-8 h-8 rounded-full border border-border flex-shrink-0">
            <AvatarImage src={user?.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatarUrl}`) : ''} alt="Profile" className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-foreground text-sm font-semibold leading-none">{user?.name ?? 'User'}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{user?.role ?? ''}</p>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}