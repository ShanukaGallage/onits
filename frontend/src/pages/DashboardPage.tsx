import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Download } from 'lucide-react';
import CreateProjectModal from '../features/projects/components/CreateProjectModal';
import DashboardStats from '../features/dashboard/components/DashboardStats';
import RecentTasks from '../features/dashboard/components/RecentTasks';
import ProjectOverview from '../features/dashboard/components/ProjectOverview';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="font-jakarta">
      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-ip-on-surface tracking-tight leading-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-ip-on-surface-variant mt-1.5">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 rounded-ip-base border border-ip-outline-variant bg-ip-surface-container-lowest text-ip-on-surface text-sm font-medium hover:bg-ip-surface-container-low transition-colors">
            <Download size={15} />
            Export Report
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-ip-base bg-ip-primary text-ip-on-primary text-sm font-semibold shadow-[0_2px_8px_rgba(70,72,212,0.25)] hover:bg-ip-on-primary-fixed-variant hover:shadow-[0_4px_16px_rgba(70,72,212,0.35)] transition-all"
          >
            <Plus size={15} />
            New Project
          </button>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <DashboardStats />

      {/* ── Recent tasks ─────────────────────────────────────────────────── */}
      <RecentTasks />

      {/* ── Project overview ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <ProjectOverview />
      </div>

      <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}