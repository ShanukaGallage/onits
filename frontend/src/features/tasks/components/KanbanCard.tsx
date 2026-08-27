import { useDraggable } from '@dnd-kit/core';
import { Calendar, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { useDeleteTask } from '../hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import type { TaskWithDetails } from '../hooks/useTasks';

interface KanbanCardProps {
  task: TaskWithDetails;
  isOverlay?: boolean;
}

export default function KanbanCard({ task, isOverlay = false }: KanbanCardProps) {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'ProjectManager';
  const deleteTaskMutation = useDeleteTask();

  const handleDeleteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate({ taskId: task.id, projectId: task.projectId });
    }
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      status: task.status,
      title: task.title,
    },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const tags = task.tags || [];

  // Priority UI
  let prioBg = 'bg-muted text-muted-foreground';
  if (task.priority === 'High') {
    prioBg = 'bg-destructive/20 text-destructive';
  } else if (task.priority === 'Medium') {
    prioBg = 'bg-secondary text-secondary-foreground';
  } else if (task.priority === 'Low') {
    prioBg = 'bg-muted text-muted-foreground';
  }

  // Date UI
  const dateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleString('default', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-background rounded-[16px] border border-border p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab group flex flex-col ${
        isDragging && !isOverlay ? 'opacity-30' : 'opacity-100'
      } ${task.status === 'Completed' ? 'opacity-80' : ''} ${
        task.status === 'InProgress' ? 'border-l-4 border-l-ip-primary-container' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] font-mono font-medium text-muted-foreground group-hover:text-primary transition-colors">
          ON-{task.id.slice(0, 4)}
        </span>
        <div className="flex items-center gap-2">
          {isManagerOrAdmin && (
            <button onClick={handleDeleteTask} className="text-muted-foreground hover:text-destructive transition-colors" title="Delete Task">
              <Trash2 size={12} />
            </button>
          )}
          <span className={`${prioBg} text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold uppercase tracking-widest`}>
            {task.priority === 'High' && <AlertCircle size={10} />}
            {task.priority === 'Medium' ? 'MED' : task.priority}
          </span>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-foreground mb-1.5 leading-tight">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {task.status === 'Completed' && (
        <div className="mt-1 mb-3 bg-muted p-2 rounded border border-border/30 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-[#10b981]" />
          <span className="text-xs text-muted-foreground italic">Done</span>
        </div>
      )}


      <div className="flex justify-between items-end mt-auto pt-3 border-t border-border/30">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span key={i} className="bg-muted text-muted-foreground text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md uppercase">
              {t}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {dateStr && (
            <span className={`text-xs flex items-center gap-1 font-medium ${
              task.status === 'InProgress' ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              <Calendar size={12} /> {dateStr}
            </span>
          )}

          {task.assignments && task.assignments.length > 0 && (
            <div className="flex -space-x-1.5 ml-1">
              {task.assignments.slice(0, 3).map((a) => a.user ? (
                <div key={a.userId} className="w-5 h-5 rounded-full border-2 border-ip-surface bg-primary text-primary-foreground flex items-center justify-center font-bold text-[9px] z-10">
                  {a.user.name.charAt(0).toUpperCase()}
                </div>
              ) : null)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}