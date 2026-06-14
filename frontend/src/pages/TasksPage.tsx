import { useState } from 'react';
import KanbanBoard from '@/features/tasks/components/KanbanBoard';
import TaskTable from '@/features/tasks/components/TaskTable';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FolderKanban, TableProperties, LayoutDashboard, Loader2 } from 'lucide-react';

export default function TasksPage() {
  const { data: projects, isLoading } = useProjects();
  const [projectId, setProjectId] = useState<string>('');
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-500" />
            Task Management
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Select a project to view and manage its tasks
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-full sm:w-[250px] bg-neutral-900 border-neutral-800">
              <SelectValue placeholder="Select a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 h-auto text-xs font-medium rounded-md transition-all ${
                view === 'kanban' 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              Board
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('table')}
              className={`px-3 py-1.5 h-auto text-xs font-medium rounded-md transition-all ${
                view === 'table' 
                  ? 'bg-neutral-800 text-white shadow-sm' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TableProperties className="w-4 h-4 mr-1.5" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {!projectId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
          <FolderKanban className="w-10 h-10 text-neutral-600" />
          <p className="text-sm font-medium text-neutral-300">No project selected</p>
          <p className="text-xs text-neutral-500">
            Please select a project from the dropdown to view its tasks.
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {view === 'kanban' ? (
            <KanbanBoard projectId={projectId} />
          ) : (
            <TaskTable projectId={projectId} />
          )}
        </div>
      )}
    </div>
  );
}
