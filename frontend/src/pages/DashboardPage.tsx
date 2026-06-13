import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import CreateProjectModal from '../features/projects/components/CreateProjectModal';
import DashboardStats from '../features/dashboard/components/DashboardStats';
import RecentTasks from '../features/dashboard/components/RecentTasks';
import ProjectOverview from '../features/dashboard/components/ProjectOverview';

export default function DashboardPage() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 4px' }}>
          Welcome back, {user?.name ?? 'User'} 👋
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Here's what's happening with your projects today.
        </p>
      </div>

      <DashboardStats />
      <RecentTasks />
      <ProjectOverview />

      {/* Projects */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Projects</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}