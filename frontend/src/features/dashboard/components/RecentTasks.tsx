import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, Circle, ArrowRight, Plus } from 'lucide-react';
import { useProjects } from '../../projects/hooks/useProjects';
import { useTasks, type TaskWithDetails } from '../../tasks/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import CreateTaskModal from '../../tasks/components/CreateTaskModal';

// ─── Priority colours ─────────────────────────────────────────────────────────
const PRIORITY_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  High:   { label: 'High',   color: '#ba1a1a', bg: '#ffdad6', border: 'rgba(186,26,26,0.2)'  },
  Medium: { label: 'Medium', color: '#b45309', bg: '#fef3c7', border: 'rgba(180,83,9,0.2)'   },
  Low:    { label: 'Low',    color: '#464554', bg: '#e0e1f4', border: 'rgba(70,69,84,0.2)'   },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  ToDo:       <Circle      size={14} className="text-muted-foreground" />,
  InProgress: <Clock       size={14} className="text-primary" />,
  Completed:  <CheckCircle2 size={14} className="text-emerald-500" />,
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
  const { projects, isLoading } = useProjects();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const canCreateTask = user?.role === 'Admin' || user?.role === 'ProjectManager';

  const allTasks: (TaskWithDetails & { projectName: string })[] = [];
  function collectTasks(tasks: (TaskWithDetails & { projectName: string })[]) {
    allTasks.push(...tasks);
  }

  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-sm font-bold text-foreground tracking-tight">Recent Tasks</h2>
        <div className="flex items-center gap-3">
          {canCreateTask && (
            <button
              id="add-task-btn"
              onClick={() => setCreateTaskOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs font-semibold hover:bg-primary/20/20 hover:text-primary transition-colors"
            >
              <Plus size={13} />
              Add Task
            </button>
          )}
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1 text-primary text-xs font-semibold hover:text-primary/90 transition-colors"
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
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-1">
              <Skeleton className="h-4 w-4 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/5 bg-muted" />
                <Skeleton className="h-3 w-1/4 bg-muted" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && recentTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <AlertCircle size={26} className="mb-2 opacity-40" />
          <p className="text-sm">No tasks yet. Create a task inside any project.</p>
        </div>
      )}

      {/* Task rows */}
      {!isLoading && recentTasks.length > 0 && (
        <div className="divide-y divide-ip-outline-variant/50">
          {recentTasks.map((task) => {
            const prio = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Low;
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
            return (
              <div
                key={task.id}
                onClick={() => navigate(`/projects/${task.projectId}`)}
                className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {/* Status icon */}
                <span className="flex-shrink-0">{STATUS_ICONS[task.status]}</span>

                {/* Title + project */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    task.status === 'Completed'
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground'
                  }`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {task.projectName}
                    {task.dueDate && (
                      <span className={`ml-2 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        · Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>

                {/* Priority badge */}
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: prio.bg, color: prio.color, border: `1px solid ${prio.border}` }}
                >
                  {prio.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <CreateTaskModal open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
    </div>
  );
}
