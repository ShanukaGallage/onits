import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreHorizontal } from 'lucide-react';
import type { TaskStatus } from '@/types';
import type { TaskWithDetails } from '../hooks/useTasks';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: TaskWithDetails[];
  dotColor: string;
}

export default function KanbanColumn({ title, status, tasks, dotColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`w-[320px] flex flex-col h-full bg-muted/50 rounded-xl border border-border/50 p-2 transition-colors duration-200 ${
        isOver ? 'bg-muted border-primary ring-1 ring-primary/30' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3 px-2 pt-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <span className="bg-muted text-muted-foreground text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {status === 'ToDo' && (
            <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-background">
              <Plus size={16} />
            </button>
          )}
          <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-background">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar pb-4">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="h-24 border border-dashed border-border/50 rounded-[16px] flex items-center justify-center text-sm text-muted-foreground italic">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}