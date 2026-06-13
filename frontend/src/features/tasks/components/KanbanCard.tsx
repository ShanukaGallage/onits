import { useDraggable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import type { TaskWithDetails } from '../hooks/useTasks';

interface KanbanCardProps {
  task: TaskWithDetails;
}

export default function KanbanCard({
  task,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      status: task.status,
      title: task.title,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-md border p-3 space-y-2 cursor-grab ${
        isDragging
          ? 'opacity-50 shadow-xl'
          : ''
      }`}
    >
      <p className="font-medium">
        {task.title}
      </p>

      <Badge
        variant={
          task.priority === 'High'
            ? 'destructive'
            : 'secondary'
        }
      >
        {task.priority}
      </Badge>

      {task.dueDate && (
        <p className="text-sm text-muted-foreground">
          Due:{' '}
          {new Date(
            task.dueDate
          ).toLocaleDateString()}
        </p>
      )}

      <div className="flex gap-1">
        {task.assignments
          .slice(0, 3)
          .map((assignment) => (
            <div
              key={assignment.user.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium"
              title={assignment.user.name}
            >
              {assignment.user.name
                .charAt(0)
                .toUpperCase()}
            </div>
          ))}
      </div>
    </div>
  );
}