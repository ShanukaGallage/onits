import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useRealtimeTasks } from '../hooks/useRealtimeTasks';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { TaskWithDetails } from '../hooks/useTasks';
import { useUpdateTaskStatus } from '../hooks/useTasks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskTableProps {
  projectId: string;
}

export default function TaskTable({ projectId }: TaskTableProps) {
  useRealtimeTasks(projectId);
  const { data: rawTasks, isLoading } = useTasks(projectId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  const tasks = rawTasks?.filter(t => 
    !searchQuery || 
    t.title.toLowerCase().includes(searchQuery) ||
    t.description?.toLowerCase().includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.05)]">
      
      {/* Table Header */}
      <div className="grid grid-cols-[32px_1fr_80px_100px_120px_80px] md:grid-cols-[32px_1fr_100px_150px_120px_100px_100px] gap-4 p-4 bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
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
            <div className="bg-muted py-2 px-4 border-b border-border text-sm font-semibold text-foreground flex items-center gap-1.5">
              <ChevronDown size={16} className="text-accent-foreground" />
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
        <div className="p-10 text-center text-muted-foreground text-sm">
          No tasks found.
        </div>
      )}
    </div>
  );
}

// ─── Row Component ─────────────────────────────────────────────────────────────

function TaskRow({ task, onClick }: { task: TaskWithDetails; onClick: () => void }) {
  const isDone = task.status === 'Completed';
  const updateTaskStatus = useUpdateTaskStatus();

  const tags = task.tags || [];

  // Status Chip config
  let statusBadge = { label: 'To Do', cls: 'bg-muted text-muted-foreground' };
  if (task.status === 'InProgress') statusBadge = { label: 'In Progress', cls: 'bg-secondary text-secondary-foreground' };
  if (task.status === 'Completed') statusBadge = { label: 'In Review', cls: 'bg-accent text-accent-foreground' };

  // Priority config
  let prioDot = 'bg-border';
  let prioBadge = 'bg-muted text-muted-foreground';
  if (task.priority === 'High') {
    prioDot = 'bg-primary';
    prioBadge = 'bg-primary/20 text-primary/90';
  } else if (task.priority === 'Medium') {
    prioDot = 'bg-accent';
    prioBadge = 'bg-accent/50 text-accent-foreground';
  } else if (task.priority === 'Low') {
    prioDot = 'bg-accent/80';
  }

  // Date
  const dateStr = task.dueDate 
    ? new Date(task.dueDate).toLocaleString('default', { month: 'short', day: 'numeric' })
    : '-';

  return (
    <div 
      onClick={onClick}
      className={`grid grid-cols-[32px_1fr_80px_100px_120px_80px] md:grid-cols-[32px_1fr_100px_150px_120px_100px_100px] gap-4 p-4 border-b border-border items-center hover:bg-muted/50 transition-colors cursor-pointer bg-card last:border-b-0`}
    >
      {/* Priority Dot */}
      <div className="flex justify-center">
        <span className={`w-2 h-2 rounded-full ${prioDot}`} title={`${task.priority} Priority`} />
      </div>

      {/* Title & Desc */}
      <div className="min-w-0">
        <div className={`text-sm font-medium text-foreground truncate ${isDone ? 'line-through opacity-70' : ''}`}>
          {task.title}
        </div>
        {task.description && (
          <div className={`text-xs text-muted-foreground truncate mt-0.5 ${isDone ? 'opacity-70' : ''}`}>
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
          <span key={i} className={`px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono ${isDone ? 'opacity-70' : ''}`}>
            {t}
          </span>
        ))}
      </div>

      {/* Status */}
      <div onClick={(e) => e.stopPropagation()}>
        <Select
          value={task.status}
          onValueChange={(val: 'ToDo' | 'InProgress' | 'Completed') => {
            updateTaskStatus.mutate({ taskId: task.id, status: val });
          }}
        >
          <SelectTrigger className={`h-7 px-2 py-1 text-[11px] font-mono font-medium rounded border-0 shadow-none focus:ring-0 w-fit ${statusBadge.cls}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ToDo">To Do</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Completed">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date */}
      <div className={`text-xs text-muted-foreground ${isDone ? 'opacity-70' : ''}`}>
        {dateStr}
      </div>

      {/* ID */}
      <div className={`text-[11px] font-mono text-muted-foreground text-right hidden md:block ${isDone ? 'opacity-70' : ''}`}>
        ON-{task.id.slice(0, 4)}
      </div>
    </div>
  );
}