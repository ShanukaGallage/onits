import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../features/projects/hooks/useProjects';
import { useTasks, type TaskWithDetails } from '../features/tasks/hooks/useTasks';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import {
  Plus, FolderKanban, ListChecks, CheckCircle2,
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
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="flex items-center justify-center" style={{ color: iconColor }}>
          <Icon size={16} />
        </span>
      </div>
      <div className="flex items-end gap-2">
        {value === null ? (
          <Skeleton className="h-7 w-12 bg-muted" />
        ) : (
          <span className="text-2xl font-bold leading-tight text-foreground">{value}</span>
        )}
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold mb-0.5 ${trendUp ? 'text-primary' : 'text-destructive'}`}>
            {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </span>
        )}
        {trendLabel && !trend && (
          <span className="text-[11px] text-muted-foreground mb-0.5 font-medium">{trendLabel}</span>
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
      return { label: 'Overdue', cls: 'bg-destructive/20/40 text-destructive border-destructive/30' };
    if (daysLeft <= 2)
      return { label: 'At Risk', cls: 'bg-destructive/20/30 text-destructive border-destructive/30' };
    if (task.status === 'InProgress')
      return { label: 'In Progress', cls: 'bg-primary/10 text-primary border-primary/20' };
    return { label: 'Pending', cls: 'bg-muted text-muted-foreground border-border' };
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <CalendarDays size={13} className="text-primary" />
        <h3 className="text-xs font-bold text-foreground">Upcoming Deadlines</h3>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
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
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Date badge */}
                  <div className="min-w-[44px] bg-muted border border-border/50 rounded-sm text-center px-1.5 py-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none">
                      {d.toLocaleString('default', { month: 'short' })}
                    </p>
                    <p className={`text-sm font-bold leading-tight mt-0.5 ${
                      chip.label === 'At Risk' || chip.label === 'Overdue'
                        ? 'text-destructive'
                        : chip.label === 'In Progress'
                        ? 'text-primary'
                        : 'text-accent-foreground'
                    }`}>
                      {d.getDate()}
                    </p>
                  </div>
                  {/* Info */}
                  <div>
                    <p className="text-xs font-medium text-foreground">{task.title}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
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
      return { Icon: CheckCircle, color: 'text-primary' };
    if (m.includes('error') || m.includes('fail') || m.includes('overdue') || m.includes('at risk'))
      return { Icon: AlertTriangle, color: 'text-destructive' };
    return { Icon: Info, color: 'text-accent-foreground' };
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-foreground">Recent Activity</h3>
        <button onClick={() => navigate('/inbox')} className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:opacity-80">
          View all <ArrowRight size={11} />
        </button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-4 h-4 rounded-full bg-muted flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-3/4 bg-muted" />
                <Skeleton className="h-2.5 w-1/2 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && recent.length === 0 && (
        <div className="flex flex-col items-center py-5 text-muted-foreground">
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
                <span className="absolute -left-[9px] bg-background p-0.5 rounded-full border-2 border-ip-surface-container-high flex items-center justify-center">
                  <Icon size={11} className={color} />
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                  <p className={`text-xs font-medium leading-snug ${n.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {n.message}
                  </p>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">{timeAgo(n.createdAt)}</span>
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
    'bg-primary', 'bg-accent', 'bg-primary', 'bg-accent',
  ];
  const textColors = [
    'text-primary', 'text-accent-foreground', 'text-primary', 'text-accent-foreground',
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <h3 className="text-xs font-bold text-foreground mb-3">Sprint Progress</h3>

      {projectProgress.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3 text-center">No projects yet.</p>
      ) : (
        <div className="space-y-3">
          {projectProgress.map(({ id, name, pct, done, total }, idx) => (
            <div key={id} onClick={() => navigate(`/projects/${id}`)} className="cursor-pointer group">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[140px]">{name}</span>
                <span className={`text-[11px] font-bold ${textColors[idx % 2]}`}>{pct}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColors[idx % 2]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{done}/{total} tasks done</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border/50 text-center">
        <span className="text-[11px] text-muted-foreground">{projects.length} active project{projects.length !== 1 ? 's' : ''}</span>
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
    <div className="bg-card border border-border rounded-lg p-4 shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <h3 className="text-xs font-bold text-foreground mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-md border border-border hover:border-primary hover:bg-muted/50 transition-all text-muted-foreground hover:text-primary group"
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
    <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center justify-between shadow-[0_1px_4px_rgba(70,72,212,0.05)]">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-medium text-foreground">All Systems Operational</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap size={11} className="text-primary" />
        <span className="text-[10px] text-muted-foreground">OnIts v1.0</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
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
          <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here is what's happening with your projects today.
          </p>
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