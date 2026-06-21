import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProject } from '../hooks/useProjects';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal';
import { 
  TrendingUp, Users, FileText, Link as LinkIcon, 
  Upload, Plus, Edit2, Play, ExternalLink, Loader2, ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';
import type { ProjectStatus } from '@/types';

export default function ProjectDetail({ projectId }: { projectId?: string }) {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const id = projectId || paramProjectId;
  const navigate = useNavigate();
  const { project, isLoading, isError } = useProject(id);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-ip-primary" size={32} /></div>;
  if (isError || !project) return <div className="p-6 text-ip-error">Project not found or failed to load.</div>;

  // Calculate Sprint Progress
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'InProgress').length;
  const todoTasks = tasks.filter(t => t.status === 'ToDo').length;

  const donePercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const todoPercent = totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0;

  const getAvatarUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${apiUrl.replace('/api', '')}${path}`;
  };

  const getInitials = (name?: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  };

  // Status Badge mappings
  const statusColors: Record<ProjectStatus, string> = {
    Planning: 'bg-ip-surface-variant text-ip-on-surface-variant',
    InProgress: 'bg-ip-primary-fixed text-ip-on-primary-fixed',
    Completed: 'bg-ip-surface-container-highest text-ip-tertiary',
    Archived: 'bg-ip-surface-container-highest text-ip-outline'
  };

  return (
    <div className="font-jakarta max-w-[1200px] mx-auto pb-12 space-y-8 animate-in fade-in duration-300">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm font-medium text-ip-on-surface-variant hover:text-ip-primary transition-colors mt-2"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${statusColors[project.status]}`}>
              {project.status === 'InProgress' ? 'ACTIVE' : project.status}
            </span>
            <span className="font-mono text-[12px] font-medium tracking-wider text-ip-outline uppercase">
              PRJ-{project.id.split('-')[0]}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-ip-on-surface tracking-tight leading-none mb-3">
            {project.name}
          </h1>
          <p className="text-[15px] text-ip-on-surface-variant max-w-2xl leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
        </div>
        
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={() => setCreateTaskOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ip-outline-variant bg-ip-surface hover:bg-ip-surface-container-low text-ip-on-surface font-semibold text-[14px] transition-colors"
          >
            <Plus size={16} /> Add Task
          </button>
          <button 
            onClick={() => toast.info('Edit functionality coming soon!')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ip-outline-variant bg-ip-surface hover:bg-ip-surface-container-low text-ip-on-surface font-semibold text-[14px] transition-colors"
          >
            <Edit2 size={16} /> Edit Project
          </button>
          <button 
            onClick={() => toast.info('Sprint management coming soon!')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ip-primary hover:bg-ip-on-primary-fixed-variant text-ip-on-primary font-bold text-[14px] shadow-[0_2px_12px_rgba(70,72,212,0.25)] transition-all hover:-translate-y-0.5"
          >
            <Play size={16} fill="currentColor" /> Start Sprint
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sprint Progress */}
        <div className="lg:col-span-2 bg-ip-surface-container-lowest border border-ip-outline-variant rounded-3xl p-6 md:p-8 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-ip-on-surface flex items-center gap-2.5">
              <TrendingUp className="text-ip-primary" size={24} /> Sprint Progress
            </h3>
            <span className="text-xs font-bold uppercase tracking-widest text-ip-on-surface-variant bg-ip-surface-container py-1 px-3 rounded-md">
              SPRINT 44
            </span>
          </div>
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-[64px] font-bold text-ip-primary leading-none tracking-tighter">
                {donePercent}%
              </div>
              <div className="text-sm font-medium text-ip-on-surface-variant mt-1">
                Tasks Completed
              </div>
            </div>
            <div className="text-right">
              <div className="text-ip-on-surface font-bold text-[15px]">
                {doneTasks} <span className="text-ip-outline font-medium mx-1">/</span> {totalTasks} TASKS
              </div>
              <div className="text-ip-error font-semibold text-sm mt-1">
                5 Days Remaining
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3.5 w-full flex rounded-full overflow-hidden bg-ip-surface-container-high mt-4">
            <div className="h-full bg-ip-primary transition-all duration-1000" style={{ width: `${donePercent}%` }} />
            <div className="h-full bg-ip-outline-variant transition-all duration-1000" style={{ width: `${inProgressPercent}%` }} />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-5 text-[13px] font-medium text-ip-on-surface-variant">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-ip-primary" /> Done ({donePercent}%)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-ip-outline-variant" /> In Progress ({inProgressPercent}%)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-ip-surface-container-high" /> To Do ({todoPercent}%)
            </div>
          </div>
        </div>

        {/* Core Team */}
        <div className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-3xl p-6 md:p-8 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h3 className="text-xl font-bold text-ip-on-surface flex items-center gap-2.5 mb-6">
            <Users className="text-ip-on-surface-variant" size={22} /> Core Team
          </h3>
          
          <div className="flex flex-col gap-4">
            {project.members?.slice(0, 4).map(member => {
              const u = member.user;
              const avatarUrl = getAvatarUrl(u?.avatarUrl);
              return (
                <div key={member.userId} className="flex items-center gap-4">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={u?.name} className="w-11 h-11 rounded-full object-cover border border-ip-outline-variant" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-ip-primary to-ip-primary-container text-ip-on-primary flex items-center justify-center font-bold text-sm">
                      {getInitials(u?.name)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-ip-on-surface text-[15px]">{u?.name}</div>
                    <div className="text-[13px] text-ip-on-surface-variant font-medium mt-0.5">
                      {u?.role === 'Admin' ? 'Project Lead' : u?.role === 'ProjectManager' ? 'Manager' : 'Engineer'}
                    </div>
                  </div>
                </div>
              );
            })}
            
            <button 
              onClick={() => toast.info('View all members coming soon!')}
              className="flex items-center gap-4 mt-2 group"
            >
              <div className="w-11 h-11 rounded-full border-2 border-dashed border-ip-outline-variant bg-ip-surface flex items-center justify-center font-mono text-[13px] font-bold text-ip-on-surface-variant group-hover:bg-ip-surface-container-low transition-colors">
                +{(project.members?.length || 0)}
              </div>
              <span className="font-bold text-ip-primary text-[14px] group-hover:text-ip-on-primary-fixed-variant transition-colors">
                View All Members
              </span>
            </button>
          </div>
        </div>

        {/* Key Documents */}
        <div className="lg:col-span-1 bg-ip-surface-container-lowest border border-ip-outline-variant rounded-3xl p-6 md:p-8 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6 border-b border-ip-outline-variant/50 pb-4">
            <h3 className="text-[18px] font-bold text-ip-on-surface flex items-center gap-2.5">
              <FileText className="text-ip-on-surface-variant" size={20} /> Key Documents
            </h3>
            <button className="text-ip-primary hover:text-ip-on-primary-fixed-variant font-semibold text-[13px] flex items-center gap-1.5 transition-colors">
              <Upload size={14} /> Upload
            </button>
          </div>
          
          <div className="flex flex-col gap-5">
            {[
              { name: 'Architecture_v2.pdf', time: 'Updated 2 days ago', bg: 'bg-red-50 text-red-600 border-red-100' },
              { name: 'API_Specs_Draft.docx', time: 'Updated 1 week ago', bg: 'bg-blue-50 text-blue-600 border-blue-100' },
              { name: 'Resource_Allocation.xlsx', time: 'Updated yesterday', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            ].map((doc, i) => (
              <div key={i} className="flex items-start gap-3.5 group cursor-pointer">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${doc.bg}`}>
                  <FileText size={18} />
                </div>
                <div>
                  <div className="font-bold text-ip-on-surface text-[14px] group-hover:text-ip-primary transition-colors">
                    {doc.name}
                  </div>
                  <div className="text-[12px] font-medium text-ip-on-surface-variant mt-0.5">
                    {doc.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* External Links */}
        <div className="lg:col-span-2 bg-ip-surface-container-lowest border border-ip-outline-variant rounded-3xl p-6 md:p-8 flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6 border-b border-ip-outline-variant/50 pb-4">
            <h3 className="text-[18px] font-bold text-ip-on-surface flex items-center gap-2.5">
              <LinkIcon className="text-ip-on-surface-variant" size={20} /> External Links
            </h3>
            <button className="text-ip-primary hover:text-ip-on-primary-fixed-variant font-semibold text-[13px] flex items-center gap-1.5 transition-colors">
              <LinkIcon size={14} /> Add Link
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Staging Env', url: 'https://staging.nexus.internal' },
              { title: 'Jira Board', url: 'https://jira.corp/NEXUS' },
              { title: 'Datadog Dashboard', url: 'https://app.datadoghq.com/dash' },
              { title: 'GitLab Repo', url: 'https://gitlab.corp/nexus-core' },
            ].map((link, i) => (
              <div key={i} className="border border-ip-outline-variant rounded-2xl p-4 flex items-center gap-4 hover:border-ip-primary/40 hover:bg-ip-surface-container-lowest cursor-pointer transition-all group">
                <div className="w-10 h-10 rounded-xl bg-ip-surface flex items-center justify-center text-ip-on-surface-variant group-hover:text-ip-primary transition-colors">
                  <ExternalLink size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-ip-on-surface text-[14px]">{link.title}</div>
                  <div className="text-[12px] font-medium text-ip-outline truncate mt-0.5">
                    {link.url}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <CreateTaskModal 
        open={createTaskOpen} 
        onOpenChange={setCreateTaskOpen}
        defaultProjectId={id}
      />
    </div>
  );
}
