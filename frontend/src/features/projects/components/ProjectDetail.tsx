import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProject } from '../hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal';
import KanbanBoard from '@/features/tasks/components/KanbanBoard';
import TaskTable from '@/features/tasks/components/TaskTable';
import EditProjectModal from './EditProjectModal';
import ManageTeamModal from './ManageTeamModal';
import { useRealtimeTasks } from '@/features/tasks/hooks/useRealtimeTasks';
import { 
  TrendingUp, Users, FileText, Link as LinkIcon, 
  Upload, Plus, Edit2, ExternalLink, Loader2, ArrowLeft,
  Calendar,
  Globe, Lock, Tag
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl, getInitials } from '@/lib/utils';
import type { ProjectStatus } from '@/types';

export default function ProjectDetail({ projectId }: { projectId?: string }) {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const id = projectId || paramProjectId;
  const navigate = useNavigate();
  const { project, isLoading, isError, mutate } = useProject(id);
  useRealtimeTasks(id || '');
  const { user } = useAuth();
  
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [manageTeamOpen, setManageTeamOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'List' | 'Board'>('List');

  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'ProjectManager';

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (isError || !project) return <div className="p-6 text-destructive">Project not found or failed to load.</div>;

  // Calculate Sprint Progress
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'InProgress').length;


  const donePercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;


  // Status Badge mappings
  const statusColors: Record<ProjectStatus, string> = {
    Planning: 'bg-muted text-muted-foreground',
    InProgress: 'bg-primary/20 text-primary',
    Completed: 'bg-muted text-accent-foreground',
    Archived: 'bg-muted text-muted-foreground'
  };

  return (
    <div className="font-jakarta max-w-[1400px] mx-auto pb-12 space-y-4 animate-in fade-in duration-300">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground hover:text-primary transition-colors mt-2"
      >
        <ArrowLeft size={14} /> Back to Projects
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ======================= */}
        {/* LEFT COLUMN: MAIN TASKS */}
        {/* ======================= */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm relative overflow-hidden">
            {project.colorCode && (
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: project.colorCode }} />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${statusColors[project.status]}`}>
                  {project.status === 'InProgress' ? 'ACTIVE' : project.status}
                </span>
                <span className="font-mono text-[11px] font-bold text-foreground uppercase bg-muted px-1.5 rounded border border-border">
                  {project.projectKey || `PRJ-${project.id.split('-')[0]}`}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight leading-none">
                {project.name}
              </h1>
            </div>
            
            <div className="flex gap-2 shrink-0">
              {isManagerOrAdmin && (
                <button 
                  onClick={() => setEditProjectOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted/50 text-muted-foreground transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              )}

              <button 
                onClick={() => setCreateTaskOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[13px] shadow-sm transition-all"
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
          </div>

          {/* Sprint Progress (Compact) */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center gap-4">
            <div className="shrink-0 flex items-center gap-3 w-40">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <TrendingUp size={20} className="text-primary" style={{ color: project.colorCode || undefined }} />
              </div>
              <div>
                <div className="text-[20px] font-bold leading-none" style={{ color: project.colorCode || '#4648d4' }}>
                  {donePercent}%
                </div>
                <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                  Completed
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between text-[11px] font-bold text-muted-foreground mb-1.5">
                <span>{doneTasks} / {totalTasks} Tasks</span>
                <span className="text-destructive">5 Days Left</span>
              </div>
              <div className="h-2 w-full flex rounded-full overflow-hidden bg-muted">
                <div className="h-full transition-all duration-1000" style={{ width: `${donePercent}%`, backgroundColor: project.colorCode || '#4648d4' }} />
                <div className="h-full bg-border transition-all duration-1000 opacity-50" style={{ width: `${inProgressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Task View Tabs & Content */}
          <div className="flex flex-col flex-1 bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[600px]">
            <div className="flex border-b border-border bg-card sticky top-0 z-10 px-4">
              <button 
                onClick={() => setActiveTab('List')}
                className={`px-4 py-3 text-[13px] transition-colors ${activeTab === 'List' ? 'text-primary border-b-2 border-primary font-bold' : 'text-muted-foreground hover:text-primary font-medium'}`}
              >
                List View
              </button>
              <button 
                onClick={() => setActiveTab('Board')}
                className={`px-4 py-3 text-[13px] transition-colors ${activeTab === 'Board' ? 'text-primary border-b-2 border-primary font-bold' : 'text-muted-foreground hover:text-primary font-medium'}`}
              >
                Kanban Board
              </button>
            </div>

            <div className="p-4 flex-1 overflow-x-auto bg-card">
              {/* Board View */}
              {activeTab === 'Board' && (
                <KanbanBoard projectId={project.id} />
              )}

              {/* List View */}
              {activeTab === 'List' && (
                <TaskTable projectId={project.id} />
              )}
            </div>
          </div>
        </div>

        {/* ======================= */}
        {/* RIGHT COLUMN: SIDE PANEL*/}
        {/* ======================= */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Project Details */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-4">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <FileText size={12} /> Description
              </h3>
              <p className="text-[13px] text-foreground leading-relaxed">
                {project.description || <span className="italic text-muted-foreground">No description provided.</span>}
              </p>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-md text-[10px] font-bold text-muted-foreground">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Visibility</h3>
                <span className="flex items-center gap-1 text-[12px] font-bold text-foreground">
                  {project.visibility === 'PRIVATE' ? <Lock size={12} className="text-muted-foreground" /> : <Globe size={12} className="text-primary" />}
                  {project.visibility === 'PRIVATE' ? 'Private' : 'Public'}
                </span>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Deadline</h3>
                <span className="flex items-center gap-1 text-[12px] font-bold text-foreground">
                  <Calendar size={12} className="text-primary" />
                  {project.estimatedCompletionDate ? new Date(project.estimatedCompletionDate).toLocaleDateString() : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Core Team */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                <Users className="text-muted-foreground" size={16} /> Core Team
              </h3>
              {isManagerOrAdmin && (
                <button onClick={() => setManageTeamOpen(true)} className="text-[11px] font-bold text-primary hover:underline">Manage</button>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {project.members?.map(member => {
                const u = member.user;
                const avatarUrl = getAvatarUrl(u?.avatarUrl);
                return (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-border shrink-0">
                      <AvatarImage src={avatarUrl || ''} alt={u?.name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/80 to-ip-primary text-primary-foreground font-bold text-[10px]">
                        {getInitials(u?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground text-[13px] truncate">{u?.name}</div>
                      <div className="text-[11px] text-muted-foreground font-medium truncate">
                        {u?.role === 'Admin' ? 'Project Lead' : u?.role === 'ProjectManager' ? 'Manager' : 'Collaborator'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Documents */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                <FileText className="text-muted-foreground" size={16} /> Documents
              </h3>
              <button className="text-primary hover:text-primary/90 transition-colors">
                <Upload size={14} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {project.attachments && project.attachments.length > 0 ? (
                project.attachments.map((doc, i) => {
                  const getFileColor = (type: string) => {
                    if (type.includes('pdf')) return 'bg-red-50 text-red-600 border-red-100';
                    if (type.includes('word') || type.includes('document')) return 'bg-blue-50 text-blue-600 border-blue-100';
                    if (type.includes('excel') || type.includes('spreadsheet')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                    return 'bg-muted text-muted-foreground border-border';
                  };
                  return (
                    <a key={doc.id || i} href={getAvatarUrl(doc.fileUrl) || '#'} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 group cursor-pointer bg-background hover:bg-muted/50 border border-transparent hover:border-border transition-colors p-1.5 -mx-1.5 rounded-lg">
                      <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${getFileColor(doc.fileType)}`}>
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground text-[12px] group-hover:text-primary transition-colors truncate">
                          {doc.fileName}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground mt-0.5 font-mono">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="text-[12px] text-muted-foreground italic py-2 text-center bg-muted rounded-lg border border-dashed border-border">No documents</div>
              )}
            </div>
          </div>

          {/* External Links */}
          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
                <LinkIcon className="text-muted-foreground" size={16} /> Links
              </h3>
              <button className="text-primary hover:text-primary/90 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {project.externalLinks && project.externalLinks.length > 0 ? (
                project.externalLinks.map((linkStr, i) => {
                  let title = linkStr;
                  let url = linkStr;
                  
                  try {
                    const parsed = JSON.parse(linkStr);
                    if (parsed.title) title = parsed.title;
                    if (parsed.url) url = parsed.url;
                  } catch (e) {
                    // Fallback to simple URL string parsing
                  }

                  // If title wasn't extracted from JSON, try to extract hostname
                  if (title === linkStr && url === linkStr) {
                    try { title = new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch(e) {}
                  }

                  const href = url.startsWith('http') ? url : `https://${url}`;

                  return (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="border border-border rounded-lg p-2.5 flex items-center gap-3 hover:border-primary/40 hover:bg-card cursor-pointer transition-all group">
                      <div className="w-7 h-7 rounded bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                        <ExternalLink size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground text-[12px] truncate">{title}</div>
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">{url}</div>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="text-[12px] text-muted-foreground italic py-2 text-center bg-muted rounded-lg border border-dashed border-border">No links</div>
              )}
            </div>
          </div>

        </div>
      </div>

      <CreateTaskModal 
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen}
        defaultProjectId={id}
      />
      <EditProjectModal
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={project}
      />
      <ManageTeamModal
        open={manageTeamOpen}
        onOpenChange={setManageTeamOpen}
        project={project}
        onMutate={() => mutate()}
      />
    </div>
  );
}
