 import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <p className="text-sm text-gray-500">Welcome back 👋</p>
      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <LogOut size={14} />
        Logout
      </button>
    </header>
  );
}