import { FolderKanban, ListChecks, CheckCircle2, Users } from 'lucide-react';
import { useProjects } from '../../projects/hooks/useProjects';
import { useTasks } from '../../tasks/hooks/useTasks';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Per-project task aggregator ─────────────────────────────────────────────
function ProjectTaskCounts({
  projectId,
  onCounts,
}: {
  projectId: string;
  onCounts: (active: number, completed: number, members: number) => void;
}) {
  const { data } = useTasks(projectId);
  if (data) {
    const active = data.filter((t) => t.status !== 'Completed').length;
    const completed = data.filter((t) => t.status === 'Completed').length;
    const memberSet = new Set(data.flatMap((t) => t.assignments.map((a) => a.userId)));
    onCounts(active, completed, memberSet.size);
  }
  return null;
}

// ─── Stat card config ─────────────────────────────────────────────────────────
type StatConfig = {
  label: string;
  value: number | null;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
};

function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend }: StatConfig) {
  return (
    <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-lg p-5 hover:border-ip-primary/40 transition-colors shadow-[0_2px_8px_rgba(70,72,212,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-ip-on-surface-variant">{label}</span>
        <div className="w-8 h-8 rounded-ip-base flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        {value === null ? (
          <Skeleton className="h-8 w-14 rounded bg-ip-surface-container" />
        ) : (
          <span className="text-[32px] font-bold leading-none text-ip-on-surface">{value}</span>
        )}
        {trend && (
          <span className="text-xs font-semibold text-ip-primary mb-1">{trend}</span>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardStats() {
  const { data: projects, isLoading } = useProjects();

  let activeTasks = 0;
  let completedTasks = 0;

  function handleCounts(active: number, completed: number) {
    activeTasks += active;
    completedTasks += completed;
  }

  const stats: StatConfig[] = [
    {
      label:     'Total Projects',
      value:     isLoading ? null : (projects?.length ?? 0),
      icon:      FolderKanban,
      iconColor: '#4648d4',
      iconBg:    'rgba(70,72,212,0.10)',
    },
    {
      label:     'Active Tasks',
      value:     isLoading ? null : activeTasks,
      icon:      ListChecks,
      iconColor: '#712ae2',
      iconBg:    'rgba(113,42,226,0.10)',
    },
    {
      label:     'Completed',
      value:     isLoading ? null : completedTasks,
      icon:      CheckCircle2,
      iconColor: '#059669',
      iconBg:    'rgba(5,150,105,0.10)',
    },
    {
      label:     'Team Members',
      value:     isLoading ? null : 0,
      icon:      Users,
      iconColor: '#d97706',
      iconBg:    'rgba(217,119,6,0.10)',
    },
  ];

  return (
    <>
      {/* Hidden aggregators */}
      {projects?.map((p) => (
        <ProjectTaskCounts key={p.id} projectId={p.id} onCounts={handleCounts} />
      ))}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </>
  );
}
