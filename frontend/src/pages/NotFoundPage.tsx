import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-jakarta text-center px-6">
      <div className="text-[80px] font-bold text-primary/20 leading-none select-none">404</div>
      <h1 className="text-2xl font-bold text-foreground mt-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 mt-6 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow-[0_2px_8px_rgba(70,72,212,0.25)] hover:shadow-[0_4px_16px_rgba(70,72,212,0.35)] transition-all"
      >
        <Home size={15} />
        Back to Dashboard
      </button>
    </div>
  );
}