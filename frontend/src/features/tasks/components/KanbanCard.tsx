import { useDraggable } from '@dnd-kit/core';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { TaskWithDetails } from '../hooks/useTasks';

interface KanbanCardProps {
  task: TaskWithDetails;
  isOverlay?: boolean;
}

export default function KanbanCard({ task, isOverlay = false }: KanbanCardProps) {
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
  let prioBg = 'bg-ip-surface-container text-ip-on-surface-variant';
  if (task.priority === 'High') {
    prioBg = 'bg-ip-error-container text-ip-on-error-container';
  } else if (task.priority === 'Medium') {
    prioBg = 'bg-ip-secondary-container text-ip-on-secondary-container';
  } else if (task.priority === 'Low') {
    prioBg = 'bg-ip-surface-variant text-ip-on-surface-variant';
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
      className={`bg-ip-surface rounded-[16px] border border-ip-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab group flex flex-col ${
        isDragging && !isOverlay ? 'opacity-30' : 'opacity-100'
      } ${task.status === 'Completed' ? 'opacity-80' : ''} ${
        task.status === 'InProgress' ? 'border-l-4 border-l-ip-primary-container' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[11px] font-mono font-medium text-ip-outline group-hover:text-ip-primary transition-colors">
          ON-{task.id.slice(0, 4)}
        </span>
        <span className={`${prioBg} text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold uppercase tracking-widest`}>
          {task.priority === 'High' && <AlertCircle size={10} />}
          {task.priority === 'Medium' ? 'MED' : task.priority}
        </span>
      </div>

      <h4 className="text-sm font-semibold text-ip-on-surface mb-1.5 leading-tight">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-ip-on-surface-variant line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {task.status === 'Completed' && (
        <div className="mt-1 mb-3 bg-ip-surface-container p-2 rounded border border-ip-outline-variant/30 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-[#10b981]" />
          <span className="text-xs text-ip-on-surface-variant italic">Done</span>
        </div>
      )}

      {task.status === 'InProgress' && task.dueDate && (
        <div className="mb-3 mt-1">
          <div className="flex justify-between text-xs text-ip-on-surface-variant mb-1">
            <span>Progress</span>
            <span>65%</span>
          </div>
          <div className="w-full bg-ip-surface-container-high rounded-full h-1">
            <div className="bg-ip-primary-container h-1 rounded-full w-[65%]" />
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mt-auto pt-3 border-t border-ip-outline-variant/30">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span key={i} className="bg-ip-surface-variant text-ip-on-surface-variant text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md uppercase">
              {t}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {dateStr && (
            <span className={`text-xs flex items-center gap-1 font-medium ${
              task.status === 'InProgress' ? 'text-ip-error' : 'text-ip-on-surface-variant'
            }`}>
              <Calendar size={12} /> {dateStr}
            </span>
          )}

          {task.assignments && task.assignments.length > 0 && (
            <div className="flex -space-x-1.5 ml-1">
              {task.assignments.slice(0, 3).map((a) => a.user ? (
                <div key={a.userId} className="w-5 h-5 rounded-full border-2 border-ip-surface bg-ip-surface-tint text-ip-on-primary flex items-center justify-center font-bold text-[9px] z-10">
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