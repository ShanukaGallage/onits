import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../features/projects/hooks/useProjects';
import { useTasks, type TaskWithDetails } from '../features/tasks/hooks/useTasks';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import {
  Download, Plus, FolderKanban, ListChecks, CheckCircle2,
  CalendarDays, Bell, CheckCircle, AlertTriangle, Info,
  ArrowRight, Zap, CheckSquare, Inbox, User, TrendingUp, TrendingDown,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Project } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ─── Hidden per-project task aggregator ──────────────────────────────────────

type TaskBag = TaskWithDetails & { projectName: string };

function ProjectTaskCollector({
  project,
  onTasks,
}: {
  project: Project;
  onTasks: (tasks: TaskBag[]) => void;
}) {
  const { data } = useTasks(project.id);
  if (data) onTasks(data.map((t) => ({ ...t, projectName: project.name })));
  return null;
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label, value, icon: Icon, iconColor, trend, trendLabel, trendUp,
}: {
  label: string; value: number | string | null; icon: React.ElementType;
  iconColor: string; trend?: string; trendLabel?: string; trendUp?: boolean;
}) {
  return (
    <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-lg p-4 hover:border-ip-primary/40 transition-colors shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium text-ip-on-surface-variant">{label}</span>
        <span className="flex items-center justify-center" style={{ color: iconColor }}>
          <Icon size={16} />
        </span>
      </div>
      <div className="flex items-end gap-2">
        {value === null ? (
          <Skeleton className="h-7 w-12 bg-ip-surface-container" />
        ) : (
          <span className="text-2xl font-bold leading-tight text-ip-on-surface">{value}</span>
        )}
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold mb-0.5 ${trendUp ? 'text-ip-primary' : 'text-ip-error'}`}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </span>
        )}
        {trendLabel && !trend && (
          <span className="text-[11px] text-ip-on-surface-variant mb-0.5 font-medium">{trendLabel}</span>
        )}
      </div>
    </div>
  );
}

// ─── Upcoming deadlines ───────────────────────────────────────────────────────

function UpcomingDeadlines({ tasks }: { tasks: TaskBag[] }) {
  const navigate = useNavigate();
  const now = new Date();

  const upcoming = tasks
    .filter((t) => t.dueDate && t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  function getStatusChip(task: TaskBag) {
    const due = new Date(task.dueDate!);
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / 86400000);
    if (daysLeft < 0)
      return { label: 'Overdue', cls: 'bg-ip-error-container/40 text-ip-error border-ip-error/30' };
    if (daysLeft <= 2)
      return { label: 'At Risk', cls: 'bg-ip-error-container/30 text-ip-error border-ip-error/30' };
    if (task.status === 'InProgress')
      return { label: 'In Progress', cls: 'bg-ip-primary/10 text-ip-primary border-ip-primary/20' };
    return { label: 'Pending', cls: 'bg-ip-surface-container-high text-ip-on-surface-variant border-ip-outline-variant' };
  }

  return (
    <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-lg overflow-hidden shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-ip-outline-variant">
        <CalendarDays size={13} className="text-ip-primary" />
        <h3 className="text-xs font-bold text-ip-on-surface">Upcoming Deadlines</h3>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-ip-on-surface-variant">
          <CheckCircle2 size={18} className="mb-1.5 opacity-30" />
          <p className="text-xs">No upcoming deadlines — great work!</p>
        </div>
      ) : (
        <div className="divide-y divide-ip-outline-variant/50">
          {upcoming.map((task) => {
            const d = new Date(task.dueDate!);
            const chip = getStatusChip(task);
            return (
              <div
                key={task.id}
                onClick={() => navigate(`/projects/${task.projectId}`)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-ip-surface-container-low transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Date badge */}
                  <div className="min-w-[44px] bg-ip-surface-container-high border border-ip-outline-variant/50 rounded-ip-sm text-center px-1.5 py-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-ip-on-surface-variant leading-none">
                      {d.toLocaleString('default', { month: 'short' })}
                    </p>
                    <p className={`text-sm font-bold leading-tight mt-0.5 ${
                      chip.label === 'At Risk' || chip.label === 'Overdue'
                        ? 'text-ip-error'
                        : chip.label === 'In Progress'
                        ? 'text-ip-primary'
                        : 'text-ip-tertiary'
                    }`}>
                      {d.getDate()}
                    </p>
                  </div>
                  {/* Info */}
                  <div>
                    <p className="text-xs font-medium text-ip-on-surface">{task.title}</p>
                    <p className="flex items-center gap-1 text-[11px] text-ip-on-surface-variant mt-0.5">
                      <FolderKanban size={10} />
                      {task.projectName}
                    </p>
                  </div>
                </div>
                {/* Status */}
                <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${chip.cls}`}>
                  {chip.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Recent activity ──────────────────────────────────────────────────────────

function RecentActivity() {
  const { data: notifications, isLoading } = useNotifications();
  const navigate = useNavigate();

  const recent = notifications?.slice(0, 5) ?? [];

  function iconForMessage(msg: string) {
    const m = msg.toLowerCase();
    if (m.includes('complete') || m.includes('done') || m.includes('approve'))
      return { Icon: CheckCircle, color: 'text-ip-primary' };
    if (m.includes('error') || m.includes('fail') || m.includes('overdue') || m.includes('at risk'))
      return { Icon: AlertTriangle, color: 'text-ip-error' };
    return { Icon: Info, color: 'text-ip-tertiary' };
  }

  return (
    <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-lg p-4 shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-ip-on-surface">Recent Activity</h3>
        <button onClick={() => navigate('/inbox')} className="flex items-center gap-0.5 text-[11px] font-semibold text-ip-primary hover:opacity-80">
          View all <ArrowRight size={11} />
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-4 h-4 rounded-full bg-ip-surface-container flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-3/4 bg-ip-surface-container" />
                <Skeleton className="h-2.5 w-1/2 bg-ip-surface-container" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && recent.length === 0 && (
        <div className="flex flex-col items-center py-5 text-ip-on-surface-variant">
          <Bell size={16} className="mb-1.5 opacity-30" />
          <p className="text-xs">No recent activity.</p>
        </div>
      )}

      {!isLoading && recent.length > 0 && (
        <div className="relative border-l-2 border-ip-surface-container-high ml-2.5 space-y-4">
          {recent.map((n) => {
            const { Icon, color } = iconForMessage(n.message);
            return (
              <div key={n.id} className="relative pl-5">
                <span className="absolute -left-[9px] bg-ip-surface p-0.5 rounded-full border-2 border-ip-surface-container-high flex items-center justify-center">
                  <Icon size={11} className={color} />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                  <p className={`text-xs font-medium leading-snug ${n.isRead ? 'text-ip-on-surface-variant' : 'text-ip-on-surface'}`}>
                    {n.message}
                  </p>
                  <span className="text-[11px] text-ip-on-surface-variant flex-shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sprint progress ──────────────────────────────────────────────────────────

function SprintProgress({ tasks, projects }: { tasks: TaskBag[]; projects: Project[] }) {
  const navigate = useNavigate();

  const projectProgress = projects.slice(0, 4).map((p) => {
    const pt = tasks.filter((t) => t.projectId === p.id);
    const total = pt.length;
    const done = pt.filter((t) => t.status === 'Completed').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { id: p.id, name: p.name, pct, done, total };
  });

  const barColors = [
    'bg-ip-primary', 'bg-ip-tertiary', 'bg-ip-primary', 'bg-ip-tertiary',
  ];
  const textColors = [
    'text-ip-primary', 'text-ip-tertiary', 'text-ip-primary', 'text-ip-tertiary',
  ];

  return (
    <div className="bg-gradient-to-br from-ip-surface to-ip-surface-container-low border border-ip-outline-variant rounded-ip-lg p-4 shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <h3 className="text-xs font-bold text-ip-on-surface mb-3">Sprint Progress</h3>

      {projectProgress.length === 0 ? (
        <p className="text-xs text-ip-on-surface-variant py-3 text-center">No projects yet.</p>
      ) : (
        <div className="space-y-3">
          {projectProgress.map(({ id, name, pct, done, total }, idx) => (
            <div key={id} onClick={() => navigate(`/projects/${id}`)} className="cursor-pointer group">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-medium text-ip-on-surface group-hover:text-ip-primary transition-colors truncate max-w-[140px]">{name}</span>
                <span className={`text-[11px] font-bold ${textColors[idx % 2]}`}>{pct}%</span>
              </div>
              <div className="w-full bg-ip-surface-container-high rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColors[idx % 2]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-ip-on-surface-variant mt-0.5">{done}/{total} tasks done</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-ip-outline-variant/50 text-center">
        <span className="text-[11px] text-ip-on-surface-variant">{projects.length} active project{projects.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

// ─── Quick actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { icon: Plus,        label: 'New Task',     action: () => navigate('/my-tasks') },
    { icon: Inbox,       label: 'Inbox',         action: () => navigate('/inbox') },
    { icon: CheckSquare, label: 'My Tasks',      action: () => navigate('/my-tasks') },
    { icon: User,        label: 'Profile',        action: () => navigate('/profile') },
  ];

  return (
    <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-lg p-4 shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <h3 className="text-xs font-bold text-ip-on-surface mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-ip-base border border-ip-outline-variant hover:border-ip-primary hover:bg-ip-surface-container-low transition-all text-ip-on-surface-variant hover:text-ip-primary group"
          >
            <Icon size={16} className="mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Status bar ───────────────────────────────────────────────────────────────

function SystemStatus() {
  return (
    <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-lg px-4 py-2.5 flex items-center justify-between shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-ip-primary animate-pulse" />
        <span className="text-[11px] font-medium text-ip-on-surface">All Systems Operational</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap size={11} className="text-ip-primary" />
        <span className="text-[10px] text-ip-on-surface-variant">OnIts v1.0</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading } = useProjects();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // Collect all tasks across all projects
  const allTasks: TaskBag[] = [];
  function collectTasks(tasks: TaskBag[]) { allTasks.push(...tasks); }

  const activeTasks   = allTasks.filter((t) => t.status !== 'Completed').length;
  const completedTasks = allTasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="font-jakarta space-y-4">
      {/* Hidden per-project collectors */}
      {projects?.map((p) => (
        <ProjectTaskCollector key={p.id} project={p} onTasks={collectTasks} />
      ))}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-ip-on-surface tracking-tight leading-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-ip-on-surface-variant mt-0.5">
            Here is what's happening with your projects today.
          </p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-ip-base text-xs bg-ip-surface-container-high text-ip-on-surface hover:bg-ip-surface-container-highest border border-ip-outline-variant transition-colors">
            <Download size={13} />
            Export Report
          </button>
          <button
            onClick={() => navigate('/my-tasks')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ip-base text-xs bg-ip-primary-container text-ip-on-primary font-bold hover:opacity-90 transition-all"
          >
            <Plus size={13} />
            New Issue
          </button>
        </div>
      </div>

      {/* ── Metrics Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          label="Total Projects"
          value={projectsLoading ? null : (projects?.length ?? 0)}
          icon={FolderKanban}
          iconColor="#4648d4"
          trend="+12%"
          trendUp
        />
        <MetricCard
          label="Active Tasks"
          value={projectsLoading ? null : activeTasks}
          icon={ListChecks}
          iconColor="#712ae2"
          trendLabel="Stable"
        />
        <MetricCard
          label="Completed"
          value={projectsLoading ? null : completedTasks}
          icon={CheckCircle2}
          iconColor="#059669"
          trend={completedTasks > 0 ? `+${completedTasks}` : undefined}
          trendUp
        />
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <UpcomingDeadlines tasks={allTasks} />
          <RecentActivity />
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-3">
          <SprintProgress tasks={allTasks} projects={projects ?? []} />
          <QuickActions />
          <SystemStatus />
        </div>

      </div>
    </div>
  );
}