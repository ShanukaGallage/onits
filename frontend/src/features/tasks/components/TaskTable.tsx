import { useState } from 'react';
import { useTasks, useDeleteTask } from '../hooks/useTasks';

interface TaskTableProps {
  projectId: string;
}

export default function TaskTable({
  projectId,
}: TaskTableProps) {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const { data: tasks = [], isLoading } = useTasks(projectId, {
    status: status || undefined,
    priority: priority || undefined,
  });

  const deleteTask = useDeleteTask();

  if (isLoading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border px-2 py-1"
        >
          <option value="">All Statuses</option>
          <option value="ToDo">To Do</option>
          <option value="InProgress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded border px-2 py-1"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Priority</th>
            <th className="border p-2 text-left">Due Date</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="border p-2">{task.title}</td>

              <td className="border p-2">
                {task.status}
              </td>

              <td className="border p-2">
                {task.priority}
              </td>

              <td className="border p-2">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : '-'}
              </td>

              <td className="border p-2">
                <button
                  className="rounded border px-2 py-1"
                  onClick={() => {
                    if (confirm('Delete task?')) {
                      deleteTask.mutate(task.id);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}