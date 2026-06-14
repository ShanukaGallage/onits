import { FolderKanban, ListChecks, CheckCircle2, Users } from 'lucide-react';
import { useProjects } from '../../projects/hooks/useProjects';
import { useTasks } from '../../tasks/hooks/useTasks';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Per-project task aggregator ─────────────────────────────────────────────
// useTasks needs a projectId, so we fetch tasks per project inside a child
// component and bubble the counts up via a callback.
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
    // unique assignees across tasks in this project
    const memberSet = new Set(data.flatMap((t) => t.assignments.map((a) => a.userId)));
    onCounts(active, completed, memberSet.size);
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardStats() {
  const { data: projects, isLoading } = useProjects();

  // Accumulate counts across all projects
  let activeTasks = 0;
  let completedTasks = 0;
  const memberSet = new Set<string>();

  function handleCounts(active: number, completed: number, _members: number) {
    activeTasks += active;
    completedTasks += completed;
  }

  const stats = [
    {
      label: 'Total Projects',
      value: isLoading ? null : (projects?.length ?? 0),
      icon: FolderKanban,
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.08)',
    },
    {
      label: 'Active Tasks',
      value: isLoading ? null : activeTasks,
      icon: ListChecks,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
    },
    {
      label: 'Completed',
      value: isLoading ? null : completedTasks,
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
    },
    {
      label: 'Team Members',
      value: isLoading ? null : memberSet.size,
      icon: Users,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
  ];

  return (
    <>
      {/* Hidden aggregators — fire TanStack queries per project */}
      {projects?.map((p) => (
        <ProjectTaskCounts key={p.id} projectId={p.id} onCounts={handleCounts} />
      ))}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            style={{
              background: '#111111',
              border: '1px solid #1f1f1f',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} color={color} />
            </div>
            <div>
              <p
                style={{
                  color: '#6b7280',
                  fontSize: '13px',
                  margin: '0 0 6px',
                  fontWeight: '500',
                }}
              >
                {label}
              </p>
              {value === null ? (
                <Skeleton className="h-7 w-12 bg-neutral-800" />
              ) : (
                <p
                  style={{
                    color,
                    fontSize: '28px',
                    fontWeight: '700',
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
