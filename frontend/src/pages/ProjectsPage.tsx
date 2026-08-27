import { useState } from 'react';
import { Plus, Archive, ArchiveRestore, UserPlus, X, Loader2 } from 'lucide-react';
import { useProjects } from '../features/projects/hooks/useProjects';
import CreateProjectModal from '../features/projects/components/CreateProjectModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl, getInitials } from '@/lib/utils';
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
    Planning: { bg: 'bg-muted', text: 'text-muted-foreground' },
    InProgress: { bg: 'bg-primary/20', text: 'text-primary' },
    Completed: { bg: 'bg-muted', text: 'text-accent-foreground' },
    Archived: { bg: 'bg-muted', text: 'text-muted-foreground' }
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

  if (isError) return <div className="p-6 text-destructive">Failed to load projects.</div>;

  return (
    <div className="font-jakarta space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-foreground leading-tight">Project Manage</h2>
          <p className="text-[14px] text-muted-foreground mt-1">Overview and administration of all active and archived engineering projects.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`font-semibold py-2 px-4 rounded-xl transition-colors flex items-center gap-2 border text-sm ${showArchived ? 'bg-muted text-muted-foreground border-transparent' : 'bg-background text-foreground border-border hover:bg-muted/50'}`}
          >
            <Archive size={18} />
            {showArchived ? 'Active Projects' : 'Archive'}
          </button>
          <button 
            onClick={() => setCreateOpen(true)}
            className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm shadow-[0_2px_8px_rgba(70,72,212,0.2)]"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border rounded-xl border-dashed">
              <p>No projects found in this view.</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/projects/${project.id}`)}
                className={`cursor-pointer bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(70,72,212,0.02)] transition-all duration-200 ${project.status === 'Completed' || project.status === 'Archived' ? 'opacity-70 hover:opacity-100' : 'hover:shadow-[0_4px_16px_rgba(70,72,212,0.06)] hover:-translate-y-0.5'}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className={`text-[18px] font-bold text-foreground truncate ${project.status === 'Completed' ? 'line-through decoration-ip-outline' : ''}`}>
                      {project.name}
                    </h3>
                    <p className="text-[12px] font-medium tracking-wide text-muted-foreground mt-1 font-mono">
                      PRJ-{project.id.split('-')[0].toUpperCase()}
                    </p>
                  </div>
                  <span className={`${statusColors[project.status].bg} ${statusColors[project.status].text} text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider whitespace-nowrap`}>
                    {project.status === 'InProgress' ? 'In Progress' : project.status}
                  </span>
                </div>
                
                <p className="text-[14px] text-muted-foreground line-clamp-2 mt-1 flex-grow">
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
                          <Avatar className={`w-8 h-8 border-2 border-ip-surface-container-lowest ${project.status === 'Completed' ? 'grayscale' : ''}`}>
                            <AvatarImage src={avatarUrl || ''} alt={user?.name || 'Member'} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[11px] font-bold">
                              {getInitials(user?.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      );
                    })}
                    
                    {/* Extra Members Badge */}
                    {(project.members?.length || 0) > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-ip-surface-container-lowest bg-muted flex items-center justify-center font-mono text-[10px] font-medium text-muted-foreground z-10">
                        +{(project.members?.length || 0) - 3}
                      </div>
                    )}
                    
                    {/* Add Member Button inside bubble group */}
                    {project.status !== 'Archived' && project.status !== 'Completed' && (
                      <div 
                        onClick={(e) => { e.stopPropagation(); toast.info('Member assignment coming soon!'); }}
                        className="w-8 h-8 rounded-full border-2 border-ip-surface-container-lowest bg-muted border-dashed border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted hover:text-primary transition-colors z-20"
                        title="Add Member"
                      >
                        <Plus size={14} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    {project.status !== 'Archived' && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toast.info('Member assignment coming soon!'); }}
                          className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-card" 
                          title="Assign Members"
                        >
                          <UserPlus size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project.id, project.status === 'Completed' ? 'Archived' : 'Completed'); }}
                          className={`p-1.5 rounded-lg hover:bg-card transition-colors ${project.status === 'Completed' ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-destructive'}`} 
                          title={project.status === 'Completed' ? 'Archive Project' : 'Complete Project'}
                        >
                          {project.status === 'Completed' ? <Archive size={18} /> : <X size={18} />}
                        </button>
                      </>
                    )}
                    {project.status === 'Archived' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project.id, 'InProgress'); }}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-card" 
                        title="Unarchive"
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