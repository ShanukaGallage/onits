import { useDroppable } from '@dnd-kit/core';
import type { TaskStatus } from '@/types';
import type { TaskWithDetails } from '../hooks/useTasks';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: TaskWithDetails[];
}

export default function KanbanColumn({
  title,
  status,
  tasks,
}: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 border rounded-lg p-4 transition-colors ${
        isOver
          ? 'bg-blue-50 ring-2 ring-blue-300'
          : ''
      }`}
    >
      <h2 className="mb-4 font-semibold">
        {title} ({tasks.length})
      </h2>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
            />
          ))
        )}
      </div>
    </div>
  );
}