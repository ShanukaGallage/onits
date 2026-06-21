import { useState } from 'react';
import { Plus } from 'lucide-react';
import ProjectList from '../features/projects/components/ProjectList';
import CreateProjectModal from '../features/projects/components/CreateProjectModal';

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="font-jakarta space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-ip-on-surface tracking-tight">Project Manage</h1>
          <p className="text-sm text-ip-on-surface-variant mt-1">Create, manage and track your projects.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-ip-base bg-ip-primary text-ip-on-primary text-sm font-semibold shadow-[0_2px_8px_rgba(70,72,212,0.25)] hover:bg-ip-on-primary-fixed-variant hover:shadow-[0_4px_16px_rgba(70,72,212,0.35)] transition-all"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      <ProjectList />
      <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}