import { useState } from 'react';
import { Plus, Archive, ArchiveRestore, UserPlus, CheckCheck, Loader2, RotateCcw } from 'lucide-react';
import { useProjects } from '../features/projects/hooks/useProjects';
import CreateProjectModal from '../features/projects/components/CreateProjectModal';
import type { ProjectStatus } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, isLoading, isError, updateStatus } = useProjects();
  const [createOpen, setCreateOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Status visual mapping
  const statusColors: Record<ProjectStatus, { bg: string, text: string }> = {
    Planning:   { bg: 'bg-yellow-100',  text: 'text-black' },
    InProgress: { bg: 'bg-blue-100',    text: 'text-black' },
    Completed:  { bg: 'bg-green-100',   text: 'text-black' },
    Archived:   { bg: 'bg-gray-100',    text: 'text-black' }
  };

  const cardBg: Record<ProjectStatus, { bg: string, border: string, hover: string }> = {
    Planning:   { bg: 'bg-yellow-50',  border: 'border-yellow-200', hover: 'hover:shadow-[0_4px_16px_rgba(234,179,8,0.15)]'  },
    InProgress: { bg: 'bg-blue-50',    border: 'border-blue-200',   hover: 'hover:shadow-[0_4px_16px_rgba(59,130,246,0.15)]' },
    Completed:  { bg: 'bg-green-50',   border: 'border-green-200',  hover: 'hover:shadow-[0_4px_16px_rgba(34,197,94,0.15)]'  },
    Archived:   { bg: 'bg-gray-50',    border: 'border-gray-200',   hover: 'hover:shadow-[0_4px_16px_rgba(156,163,175,0.15)]'}
  };

  const handleUpdateStatus = async (id: string, newStatus: ProjectStatus) => {
    try {
      await updateStatus(id, newStatus);
      toast.success(`Project marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update project status');
    }
  };

  const filteredProjects = projects?.filter(p => 
    showArchived ? p.status === 'Archived' : p.status !== 'Archived'
  ) || [];

  const getAvatarUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${apiUrl.replace('/api', '')}${path}`;
  };

  const getInitials = (name?: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  };

  if (isError) return <div className="p-6 text-ip-error">Failed to load projects.</div>;

  return (
    <div className="font-jakarta space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-ip-on-surface leading-tight">Project Manage</h2>
          <p className="text-[14px] text-ip-on-surface-variant mt-1">Overview and administration of all active and archived engineering projects.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`font-semibold py-2 px-4 rounded-xl transition-colors flex items-center gap-2 border text-sm ${showArchived ? 'bg-ip-surface-variant text-ip-on-surface-variant border-transparent' : 'bg-ip-surface text-ip-on-surface border-ip-outline-variant hover:bg-ip-surface-container-low'}`}
          >
            <Archive size={18} />
            {showArchived ? 'Active Projects' : 'Archive'}
          </button>
          <button 
            onClick={() => setCreateOpen(true)}
            className="bg-ip-primary text-ip-on-primary font-bold py-2 px-4 rounded-xl hover:bg-ip-on-primary-fixed-variant transition-colors flex items-center gap-2 text-sm shadow-[0_2px_8px_rgba(70,72,212,0.2)]"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-ip-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-ip-on-surface-variant bg-ip-surface-container-lowest border border-ip-outline-variant rounded-xl border-dashed">
              <p>No projects found in this view.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/projects/${project.id}`)}
                className={`cursor-pointer ${cardBg[project.status].bg} border ${cardBg[project.status].border} rounded-2xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ${project.status === 'Completed' || project.status === 'Archived' ? 'opacity-75 hover:opacity-100' : `${cardBg[project.status].hover} hover:-translate-y-0.5`}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className={`text-[18px] font-bold text-ip-on-surface truncate ${project.status === 'Completed' ? 'line-through decoration-ip-outline' : ''}`}>
                      {project.name}
                    </h3>
                    <p className="text-[12px] font-medium tracking-wide text-ip-outline mt-1 font-mono">
                      PRJ-{project.id.split('-')[0].toUpperCase()}
                    </p>
                  </div>
                  <span className={`${statusColors[project.status].bg} ${statusColors[project.status].text} text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider whitespace-nowrap`}>
                    {project.status === 'InProgress' ? 'In Progress' : project.status}
                  </span>
                </div>
                
                <p className="text-[14px] text-ip-on-surface-variant line-clamp-2 mt-1 flex-grow">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="mt-4 pt-4 border-t border-ip-surface-container-high flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {/* Render Members */}
                    {project.members?.slice(0, 3).map((member) => {
                      const user = member.user;
                      const avatarUrl = getAvatarUrl(user?.avatarUrl);
                      return (
                        <div key={member.userId} title={user?.name} className="relative">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={user?.name} 
                              className={`w-8 h-8 rounded-full border-2 border-ip-surface-container-lowest object-cover ${project.status === 'Completed' ? 'grayscale' : ''}`}
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full border-2 border-ip-surface-container-lowest bg-gradient-to-br from-ip-primary to-ip-primary-container text-ip-on-primary flex items-center justify-center text-[11px] font-bold ${project.status === 'Completed' ? 'grayscale' : ''}`}>
                              {getInitials(user?.name)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Extra Members Badge */}
                    {(project.members?.length || 0) > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-ip-surface-container-lowest bg-ip-surface-container flex items-center justify-center font-mono text-[10px] font-medium text-ip-on-surface-variant z-10">
                        +{(project.members?.length || 0) - 3}
                      </div>
                    )}
                    
                    {/* Add Member Button inside bubble group */}
                    {project.status !== 'Archived' && project.status !== 'Completed' && (
                      <div 
                        onClick={(e) => { e.stopPropagation(); toast.info('Member assignment coming soon!'); }}
                        className="w-8 h-8 rounded-full border-2 border-ip-surface-container-lowest bg-ip-surface-container border-dashed border-ip-outline flex items-center justify-center text-ip-outline cursor-pointer hover:bg-ip-surface-container-high hover:text-ip-primary transition-colors z-20"
                        title="Add Member"
                      >
                        <Plus size={14} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    {/* Active project (Planning / InProgress) — show Complete + Archive */}
                    {(project.status === 'Planning' || project.status === 'InProgress') && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); toast.info('Member assignment coming soon!'); }}
                          className="text-ip-outline hover:text-ip-primary transition-colors p-1.5 rounded-lg hover:bg-white/60"
                          title="Assign Members"
                        >
                          <UserPlus size={18} />
                        </button>
                        {/* Mark as Completed — one click, stays completed */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project.id, 'Completed'); }}
                          className="text-green-500 hover:text-green-700 transition-colors p-1.5 rounded-lg hover:bg-green-100"
                          title="Mark as Completed"
                        >
                          <CheckCheck size={18} />
                        </button>
                        {/* Archive — one click, moves to Archive list */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project.id, 'Archived'); }}
                          className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-200"
                          title="Archive Project"
                        >
                          <Archive size={18} />
                        </button>
                      </>
                    )}

                    {/* Completed — show Restore to Active + Archive */}
                    {project.status === 'Completed' && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project.id, 'InProgress'); }}
                          className="text-blue-400 hover:text-blue-700 transition-colors p-1.5 rounded-lg hover:bg-blue-100"
                          title="Restore to Active"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project.id, 'Archived'); }}
                          className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-200"
                          title="Archive Project"
                        >
                          <Archive size={18} />
                        </button>
                      </>
                    )}

                    {/* Archived — show Unarchive only */}
                    {project.status === 'Archived' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project.id, 'InProgress'); }}
                        className="text-ip-outline hover:text-ip-on-surface transition-colors p-1.5 rounded-lg hover:bg-ip-surface-container-lowest"
                        title="Unarchive — restore to Active"
                      >
                        <ArchiveRestore size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      <CreateProjectModal open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) updateStatus('', 'Planning'); // Trigger mutate on close hack if we wanted to
      }} />
    </div>
  );
}