import { useNavigate } from 'react-router-dom';
import { FolderOpen, ArrowRight, Users, CalendarDays } from 'lucide-react';
import { useProjects } from '../../projects/hooks/useProjects';
import { useTasks } from '../../tasks/hooks/useTasks';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Per-project mini card ────────────────────────────────────────────────────
function ProjectCard({ project }: { project: { id: string; name: string; description?: string; createdAt: string } }) {
  const navigate = useNavigate();
  const { data: tasks } = useTasks(project.id);

  const total      = tasks?.length ?? 0;
  const completed  = tasks?.filter((t) => t.status === 'Completed').length ?? 0;
  const progress   = total > 0 ? Math.round((completed / total) * 100) : 0;
  const members    = new Set(tasks?.flatMap((t) => t.assignments.map((a) => a.userId)) ?? []).size;
  const initial    = project.name.charAt(0).toUpperCase();

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{
        background: '#111111',
        border: '1px solid #1f1f1f',
        borderRadius: '12px',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#6366f1';
        e.currentTarget.style.background = '#131313';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1f1f1f';
        e.currentTarget.style.background = '#111111';
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '15px',
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              margin: '0 0 2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.name}
          </p>
          {project.description && (
            <p
              style={{
                color: '#6b7280',
                fontSize: '12px',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {project.description}
            </p>
          )}
        </div>
        <ArrowRight size={15} color="#4b5563" style={{ flexShrink: 0 }} />
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>
            {completed}/{total} tasks
          </span>
          <span style={{ color: '#6366f1', fontSize: '12px', fontWeight: '600' }}>
            {progress}%
          </span>
        </div>
        <div style={{ height: '4px', background: '#1f1f1f', borderRadius: '99px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              borderRadius: '99px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Footer meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '12px' }}>
          <Users size={12} />
          {members} {members === 1 ? 'member' : 'members'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '12px' }}>
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
  const { data: projects, isLoading } = useProjects();

  // Show at most 6 on the dashboard overview
  const visible = projects?.slice(0, 6) ?? [];

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
          Project Overview
        </h2>
        {projects && projects.length > 6 && (
          <button
            onClick={() => navigate('/projects')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#6366f1',
              fontSize: '13px',
              fontWeight: '500',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            View all <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <Skeleton className="h-9 w-9 rounded-lg bg-neutral-800" />
                <div style={{ flex: 1 }}>
                  <Skeleton className="h-3.5 w-2/3 bg-neutral-800 mb-2" />
                  <Skeleton className="h-3 w-1/2 bg-neutral-800" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-neutral-800 mb-3" />
              <Skeleton className="h-3 w-1/3 bg-neutral-800" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && visible.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            background: '#111111',
            border: '1px dashed #1f1f1f',
            borderRadius: '12px',
            color: '#4b5563',
          }}
        >
          <FolderOpen size={28} style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '14px', margin: 0 }}>No projects yet. Create your first project above.</p>
        </div>
      )}

      {/* Grid of project cards */}
      {!isLoading && visible.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
