import KanbanBoard from '@/features/tasks/components/KanbanBoard';
import TaskTable from '@/features/tasks/components/TaskTable';

export default function TasksPage() {
  const projectId = '1';

  return (
    <div className="space-y-8 p-6">
      <KanbanBoard projectId={projectId} />
      <TaskTable projectId={projectId} />
    </div>
  );
}
