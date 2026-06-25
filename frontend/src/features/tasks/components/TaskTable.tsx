import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { TaskWithDetails } from '../hooks/useTasks';

interface TaskTableProps {
  projectId: string;
}

export default function TaskTable({ projectId }: TaskTableProps) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-ip-primary" />
      </div>
    );
  }

  // Group tasks
  const todo = tasks?.filter((t) => t.status === 'ToDo') || [];
  const inProgress = tasks?.filter((t) => t.status === 'InProgress') || [];
  const review = tasks?.filter((t) => t.status === 'Completed') || [];

  const groups = [
    { title: 'To Do', items: todo },
    { title: 'In Progress', items: inProgress },
    { title: 'Review', items: review },
  ];

  return (
    <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-ip-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.05)]">
      
      {/* Table Header */}
      <div className="grid grid-cols-[32px_1fr_80px_100px_120px_80px] md:grid-cols-[32px_1fr_100px_150px_120px_100px_100px] gap-4 p-4 bg-ip-surface-container-low border-b border-ip-outline-variant text-[11px] font-bold text-ip-on-surface-variant uppercase tracking-wider">
        <div className="text-center">Pri</div>
        <div>Task Title</div>
        <div className="hidden md:block">Priority</div>
        <div className="hidden md:block">Tags</div>
        <div>Status</div>
        <div>Due Date</div>
        <div className="text-right hidden md:block">ID</div>
      </div>

      {groups.map((group) => {
        if (group.items.length === 0) return null;
        
        return (
          <div key={group.title}>
            {/* Group Header */}
            <div className="bg-ip-surface-container py-2 px-4 border-b border-ip-outline-variant text-sm font-semibold text-ip-on-surface flex items-center gap-1.5">
              <ChevronDown size={16} className="text-ip-tertiary" />
              {group.title} ({group.items.length})
            </div>

            {/* Rows */}
            {group.items.map((task) => (
              <TaskRow key={task.id} task={task} onClick={() => navigate(`/projects/${task.projectId}`)} />
            ))}
          </div>
        );
      })}

      {!tasks?.length && (
        <div className="p-10 text-center text-ip-on-surface-variant text-sm">
          No tasks found.
        </div>
      )}
    </div>
  );
}

// ─── Row Component ─────────────────────────────────────────────────────────────

function TaskRow({ task, onClick }: { task: TaskWithDetails; onClick: () => void }) {
  const isDone = task.status === 'Completed';

  const tags = task.tags || [];

  // Status Chip config
  let statusBadge = { label: 'To Do', cls: 'bg-ip-surface-container-high text-ip-on-surface-variant' };
  if (task.status === 'InProgress') statusBadge = { label: 'In Progress', cls: 'bg-ip-secondary-container text-ip-on-secondary-container' };
  if (task.status === 'Completed') statusBadge = { label: 'In Review', cls: 'bg-ip-tertiary-fixed text-ip-ip-on-tertiary-fixed' };

  // Priority config
  let prioDot = 'bg-ip-outline';
  let prioBadge = 'bg-ip-surface-container text-ip-on-surface-variant';
  if (task.priority === 'High') {
    prioDot = 'bg-ip-primary';
    prioBadge = 'bg-ip-primary-container text-ip-on-primary-container';
  } else if (task.priority === 'Medium') {
    prioDot = 'bg-ip-tertiary';
    prioBadge = 'bg-ip-tertiary-container text-ip-on-tertiary-container';
  } else if (task.priority === 'Low') {
    prioDot = 'bg-ip-tertiary-fixed-dim';
  }

  // Date
  const dateStr = task.dueDate 
    ? new Date(task.dueDate).toLocaleString('default', { month: 'short', day: 'numeric' })
    : '-';

  return (
    <div 
      onClick={onClick}
      className={`grid grid-cols-[32px_1fr_80px_100px_120px_80px] md:grid-cols-[32px_1fr_100px_150px_120px_100px_100px] gap-4 p-4 border-b border-ip-outline-variant items-center hover:bg-ip-surface-container-low transition-colors cursor-pointer bg-ip-surface-container-lowest last:border-b-0`}
    >
      {/* Priority Dot */}
      <div className="flex justify-center">
        <span className={`w-2 h-2 rounded-full ${prioDot}`} title={`${task.priority} Priority`} />
      </div>

      {/* Title & Desc */}
      <div className="min-w-0">
        <div className={`text-sm font-medium text-ip-on-surface truncate ${isDone ? 'line-through opacity-70' : ''}`}>
          {task.title}
        </div>
        {task.description && (
          <div className={`text-xs text-ip-on-surface-variant truncate mt-0.5 ${isDone ? 'opacity-70' : ''}`}>
            {task.description}
          </div>
        )}
      </div>

      {/* Priority Badge */}
      <div className="hidden md:block">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${prioBadge}`}>
          {task.priority}
        </span>
      </div>

      {/* Tags */}
      <div className="hidden md:flex gap-1.5 flex-wrap">
        {tags.map((t, i) => (
          <span key={i} className={`px-2 py-0.5 rounded bg-ip-surface-variant text-ip-on-surface-variant text-[10px] font-mono ${isDone ? 'opacity-70' : ''}`}>
            {t}
          </span>
        ))}
      </div>

      {/* Status */}
      <div>
        <span className={`px-2 py-1 rounded text-[11px] font-mono font-medium ${statusBadge.cls}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Due Date */}
      <div className={`text-xs text-ip-on-surface-variant ${isDone ? 'opacity-70' : ''}`}>
        {dateStr}
      </div>

      {/* ID */}
      <div className={`text-[11px] font-mono text-ip-on-surface-variant text-right hidden md:block ${isDone ? 'opacity-70' : ''}`}>
        ON-{task.id.slice(0, 4)}
      </div>
    </div>
  );
}