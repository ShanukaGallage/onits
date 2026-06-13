import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, Circle, ArrowRight, Plus } from 'lucide-react';
import { useProjects } from '../../projects/hooks/useProjects';
import { useTasks, type TaskWithDetails } from '../../tasks/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import CreateTaskModal from '../../tasks/components/CreateTaskModal';

// ─── Priority colours ─────────────────────────────────────────────────────────
const PRIORITY_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  High:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  Medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  Low:    { label: 'Low',    color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  ToDo:       <Circle     size={14} className="text-neutral-500" />,
  InProgress: <Clock      size={14} className="text-indigo-400" />,
  Completed:  <CheckCircle2 size={14} className="text-emerald-400" />,
};

// ─── Per-project task fetcher ─────────────────────────────────────────────────
function ProjectTasks({
  projectId,
  projectName,
  onTasks,
}: {
  projectId: string;
  projectName: string;
  onTasks: (tasks: (TaskWithDetails & { projectName: string })[]) => void;
}) {
  const { data } = useTasks(projectId);
  if (data) {
    onTasks(data.map((t) => ({ ...t, projectName })));
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RecentTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  // Only Admin and ProjectManager may create tasks
  const canCreateTask = user?.role === 'Admin' || user?.role === 'ProjectManager';

  const allTasks: (TaskWithDetails & { projectName: string })[] = [];

  function collectTasks(tasks: (TaskWithDetails & { projectName: string })[]) {
    allTasks.push(...tasks);
  }

  // Sort by createdAt descending, take 5
  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #1f1f1f',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
          Recent Tasks
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* + Add Task — Admin & ProjectManager only */}
          {canCreateTask && (
            <button
              id="add-task-btn"
              onClick={() => setCreateTaskOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '7px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.25)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
              }}
            >
              <Plus size={13} />
              Add Task
            </button>
          )}
          <button
            onClick={() => navigate('/tasks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#6366f1',
              fontSize: '13px',
              fontWeight: '500',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            View all <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Hidden aggregators */}
      {projects?.map((p) => (
        <ProjectTasks key={p.id} projectId={p.id} projectName={p.name} onTasks={collectTasks} />
      ))}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Skeleton className="h-4 w-4 rounded-full bg-neutral-800" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Skeleton className="h-3.5 w-3/5 bg-neutral-800" />
                <Skeleton className="h-3 w-1/4 bg-neutral-800" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full bg-neutral-800" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && recentTasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#4b5563' }}>
          <AlertCircle size={28} style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '14px', margin: 0 }}>No tasks yet. Create a task inside any project.</p>
        </div>
      )}

      {/* Task rows */}
      {!isLoading && recentTasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {recentTasks.map((task) => {
            const prio = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Low;
            return (
              <div
                key={task.id}
                onClick={() => navigate(`/projects/${task.projectId}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a1a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Status icon */}
                <span style={{ flexShrink: 0 }}>{STATUS_ICONS[task.status]}</span>

                {/* Title + project */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      color: task.status === 'Completed' ? '#6b7280' : 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      margin: '0 0 2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </p>
                  <p style={{ color: '#4b5563', fontSize: '12px', margin: 0 }}>
                    {task.projectName}
                    {task.dueDate && (
                      <span style={{ color: new Date(task.dueDate) < new Date() ? '#ef4444' : '#6b7280', marginLeft: '8px' }}>
                        · Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>

                {/* Priority badge */}
                <Badge
                  style={{
                    background: prio.bg,
                    color: prio.color,
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '500',
                    flexShrink: 0,
                  }}
                >
                  {prio.label}
                </Badge>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal — rendered here so it's outside the card scroll area */}
      <CreateTaskModal open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
    </div>
  );
}
