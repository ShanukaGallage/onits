import { useNavigate } from 'react-router-dom';
import { FolderOpen, ArrowRight, Users, CalendarDays } from 'lucide-react';
import { useProjects } from '../../projects/hooks/useProjects';
import { useTasks } from '../../tasks/hooks/useTasks';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Per-project mini card ────────────────────────────────────────────────────
function ProjectCard({ project }: { project: { id: string; name: string; description?: string; createdAt: string } }) {
  const navigate = useNavigate();
  const { data: tasks } = useTasks(project.id);

  const total     = tasks?.length ?? 0;
  const completed = tasks?.filter((t) => t.status === 'Completed').length ?? 0;
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0;
  const members   = new Set(tasks?.flatMap((t) => t.assignments.map((a) => a.userId)) ?? []).size;
  const initial   = project.name.charAt(0).toUpperCase();

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-card border border-border rounded-lg p-5 cursor-pointer hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(70,72,212,0.1)] transition-all duration-200 flex flex-col gap-4"
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 bg-gradient-to-br from-primary to-primary/80 shadow-[0_2px_6px_rgba(70,72,212,0.25)]">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
          {project.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
          )}
        </div>
        <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{completed}/{total} tasks</span>
          <span className="text-xs font-semibold text-primary">{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users size={12} />
          {members} {members === 1 ? 'member' : 'members'}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays size={12} />
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProjectOverview() {
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();

  const visible = projects?.slice(0, 6) ?? [];

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground">Project Overview</h2>
        {projects && projects.length > 6 && (
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-primary text-xs font-semibold hover:text-primary/90 transition-colors"
          >
            View all <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-9 w-9 rounded-md bg-muted" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-2/3 bg-muted mb-2" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
                </div>
              </div>
              <Skeleton className="h-1.5 w-full rounded-full bg-muted mb-3" />
              <Skeleton className="h-3 w-1/3 bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 bg-card border border-dashed border-border rounded-lg text-muted-foreground">
          <FolderOpen size={26} className="mb-2 opacity-40" />
          <p className="text-sm">No projects yet. Create your first project above.</p>
        </div>
      )}

      {/* Grid of project cards */}
      {!isLoading && visible.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
