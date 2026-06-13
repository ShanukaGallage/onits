import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '../hooks/useTasks';

interface KanbanBoardProps {
  projectId: string;
}
export default function KanbanBoard({
  projectId,
}: KanbanBoardProps) {
  const { data: tasks = [], isLoading } = useTasks(projectId);

  const todoTasks = tasks.filter(
    (task) => task.status === 'ToDo'
  );

  const inProgressTasks = tasks.filter(
    (task) => task.status === 'InProgress'
  );

  const completedTasks = tasks.filter(
    (task) => task.status === 'Completed'
  );

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[1, 2, 3].map((column) => (
          <div
            key={column}
            className="flex-1 space-y-3"
          >
            <Skeleton className="h-8 w-32" />

            {[1, 2, 3].map((card) => (
              <Skeleton
                key={card}
                className="h-24 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
  <div className="flex gap-4">
    <div className="flex-1 border rounded-lg p-4">
  <h2 className="mb-4 font-semibold">
    To Do ({todoTasks.length})
  </h2>

  <div className="space-y-3">
    {todoTasks.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        No tasks
      </p>
    ) : (
      todoTasks.map((task) => (
        <div
          key={task.id}
          className="rounded-md border p-3 space-y-2"
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
              {new Date(task.dueDate).toLocaleDateString()}
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
      ))
    )}
  </div>
</div>

    <div className="flex-1 border rounded-lg p-4">
  <h2 className="mb-4 font-semibold">
    In Progress ({inProgressTasks.length})
  </h2>

  <div className="space-y-3">
    {inProgressTasks.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        No tasks
      </p>
    ) : (
      inProgressTasks.map((task) => (
        <div
          key={task.id}
          className="rounded-md border p-3 space-y-2"
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
              {new Date(task.dueDate).toLocaleDateString()}
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
      ))
    )}
  </div>
</div>

    <div className="flex-1 border rounded-lg p-4">
  <h2 className="mb-4 font-semibold">
    Completed ({completedTasks.length})
  </h2>

  <div className="space-y-3">
    {completedTasks.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        No tasks
      </p>
    ) : (
      completedTasks.map((task) => (
        <div
          key={task.id}
          className="rounded-md border p-3 space-y-2"
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
              {new Date(task.dueDate).toLocaleDateString()}
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
      ))
    )}
  </div>
</div>
  </div>
);
}