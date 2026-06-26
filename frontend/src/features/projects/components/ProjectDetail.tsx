import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useProject } from '../hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal';
import EditProjectModal from './EditProjectModal';
import ManageTeamModal from './ManageTeamModal';
import { useRealtimeTasks } from '@/features/tasks/hooks/useRealtimeTasks';
import { 
  TrendingUp, Users, FileText, Link as LinkIcon, 
  Upload, Plus, Edit2, ExternalLink, Loader2, ArrowLeft,
  CheckCircle, Calendar,
  Globe, Lock, Tag
} from 'lucide-react';
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-ip-primary" size={32} /></div>;
  if (isError || !project) return <div className="p-6 text-ip-error">Project not found or failed to load.</div>;

  // Calculate Sprint Progress
  const tasks = project.tasks || [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'InProgress').length;


  const donePercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;

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

  const taskStatusColors: Record<string, string> = {
    ToDo: 'bg-ip-surface-variant text-ip-on-surface-variant',
    InProgress: 'bg-ip-primary/10 text-ip-primary',
    InReview: 'bg-ip-tertiary/10 text-ip-tertiary',
    Completed: 'bg-ip-surface-container-highest text-ip-outline'
  };

  return (
    <div className="font-jakarta max-w-[1400px] mx-auto pb-12 space-y-4 animate-in fade-in duration-300">
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-[13px] font-bold text-ip-on-surface-variant hover:text-ip-primary transition-colors mt-2"
      >
        <ArrowLeft size={14} /> Back to Projects
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ======================= */}
        {/* LEFT COLUMN: MAIN TASKS */}
        {/* ======================= */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-ip-surface-container-lowest p-5 rounded-2xl border border-ip-outline-variant shadow-sm relative overflow-hidden">
            {project.colorCode && (
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: project.colorCode }} />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${statusColors[project.status]}`}>
                  {project.status === 'InProgress' ? 'ACTIVE' : project.status}
                </span>
                <span className="font-mono text-[11px] font-bold text-ip-on-surface uppercase bg-ip-surface-container-high px-1.5 rounded border border-ip-outline-variant">
                  {project.projectKey || `PRJ-${project.id.split('-')[0]}`}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-ip-on-surface tracking-tight leading-none">
                {project.name}
              </h1>
            </div>
            
            <div className="flex gap-2 shrink-0">
              {isManagerOrAdmin && (
                <button 
                  onClick={() => setEditProjectOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-ip-outline-variant bg-ip-surface hover:bg-ip-surface-container-low text-ip-on-surface-variant transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              )}

              <button 
                onClick={() => setCreateTaskOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ip-primary hover:bg-ip-on-primary-fixed-variant text-ip-on-primary font-bold text-[13px] shadow-sm transition-all"
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
          </div>

          {/* Sprint Progress (Compact) */}
          <div className="bg-ip-surface-container-lowest p-5 rounded-2xl border border-ip-outline-variant shadow-sm flex flex-col md:flex-row md:items-center gap-4">
            <div className="shrink-0 flex items-center gap-3 w-40">
              <div className="w-10 h-10 rounded-full bg-ip-surface-container flex items-center justify-center shrink-0">
                <TrendingUp size={20} className="text-ip-primary" style={{ color: project.colorCode || undefined }} />
              </div>
              <div>
                <div className="text-[20px] font-bold leading-none" style={{ color: project.colorCode || '#4648d4' }}>
                  {donePercent}%
                </div>
                <div className="text-[11px] font-bold uppercase text-ip-on-surface-variant tracking-wider">
                  Completed
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between text-[11px] font-bold text-ip-on-surface-variant mb-1.5">
                <span>{doneTasks} / {totalTasks} Tasks</span>
                <span className="text-ip-error">5 Days Left</span>
              </div>
              <div className="h-2 w-full flex rounded-full overflow-hidden bg-ip-surface-container-high">
                <div className="h-full transition-all duration-1000" style={{ width: `${donePercent}%`, backgroundColor: project.colorCode || '#4648d4' }} />
                <div className="h-full bg-ip-outline-variant transition-all duration-1000 opacity-50" style={{ width: `${inProgressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Task View Tabs & Content */}
          <div className="flex flex-col flex-1 bg-ip-surface-container-lowest rounded-2xl border border-ip-outline-variant shadow-sm overflow-hidden min-h-[600px]">
            <div className="flex border-b border-ip-outline-variant bg-ip-surface-container-lowest sticky top-0 z-10 px-4">
              <button 
                onClick={() => setActiveTab('List')}
                className={`px-4 py-3 text-[13px] transition-colors ${activeTab === 'List' ? 'text-ip-primary border-b-2 border-ip-primary font-bold' : 'text-ip-on-surface-variant hover:text-ip-primary font-medium'}`}
              >
                List View
              </button>
              <button 
                onClick={() => setActiveTab('Board')}
                className={`px-4 py-3 text-[13px] transition-colors ${activeTab === 'Board' ? 'text-ip-primary border-b-2 border-ip-primary font-bold' : 'text-ip-on-surface-variant hover:text-ip-primary font-medium'}`}
              >
                Kanban Board
              </button>
            </div>

            <div className="p-4 flex-1 overflow-x-auto bg-ip-surface-container-lowest">
              {/* Board View */}
              {activeTab === 'Board' && (
                <div className="flex gap-4 h-full pb-2">
                  {[
                    { id: 'todo', title: 'To Do', color: 'bg-ip-outline', tasks: tasks.filter(t => t.status === 'ToDo') },
                    { id: 'inprogress', title: 'In Progress', color: 'bg-ip-primary-container', tasks: tasks.filter(t => t.status === 'InProgress') },
                    { id: 'done', title: 'Done', color: 'bg-ip-outline-variant', tasks: tasks.filter(t => t.status === 'Completed'), opacity: 'opacity-70' }
                  ].map(col => (
                    <div key={col.id} className={`flex flex-col w-[280px] shrink-0 bg-ip-surface rounded-xl border border-ip-outline-variant overflow-hidden h-full ${col.opacity || ''}`}>
                      <div className="p-2.5 border-b border-ip-outline-variant bg-ip-surface-container-low flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${col.color}`}></span>
                          <h3 className="font-bold text-[13px] text-ip-on-surface">{col.title}</h3>
                          <span className="bg-ip-surface-container-highest text-ip-on-surface-variant font-mono text-[10px] px-1.5 rounded">
                            {col.tasks.length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                        {col.tasks.map(task => (
                          <div key={task.id} className={`bg-ip-surface-container-lowest border border-ip-outline-variant rounded-lg p-2.5 hover:shadow-sm transition-shadow cursor-grab ${col.id === 'inprogress' ? 'border-l-2 shadow-sm' : ''}`} style={col.id === 'inprogress' ? { borderLeftColor: project.colorCode || '#4648d4' } : {}}>
                            <div className="flex justify-between items-start mb-1.5">
                              <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded uppercase ${task.priority === 'High' ? 'bg-ip-error-container text-ip-on-error-container' : 'bg-ip-surface-container-highest text-ip-on-surface-variant'}`}>
                                {task.priority || 'Medium'}
                              </span>
                              <span className="font-mono text-[10px] text-ip-outline">
                                #{task.id.split('-')[0]}-{task.id.split('-')[1]?.substring(0,3)}
                              </span>
                            </div>
                            <h4 className={`font-bold text-[13px] leading-tight mb-2 ${col.id === 'done' ? 'line-through text-ip-outline' : 'text-ip-on-surface'}`}>
                              {task.title}
                            </h4>
                            
                            <div className="flex justify-between items-center mt-auto">
                              <div className={`flex items-center gap-1 text-[11px] ${col.id === 'done' ? 'text-ip-outline' : 'text-ip-on-surface-variant'}`}>
                                {col.id === 'done' ? <CheckCircle size={12} /> : <Calendar size={12} />}
                                <span className="font-mono font-medium">
                                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                </span>
                              </div>
                              {task.assignments && task.assignments.length > 0 && (
                                <div className="flex -space-x-1.5">
                                  {task.assignments.map((assignment: any) => assignment.user ? (
                                    <div key={assignment.user.id} className={`w-5 h-5 rounded-full bg-ip-surface-container-high border border-ip-outline-variant flex items-center justify-center overflow-hidden ${col.id === 'done' ? 'grayscale opacity-60' : ''}`}>
                                      {assignment.user.avatarUrl ? (
                                        <img src={getAvatarUrl(assignment.user.avatarUrl) || ''} alt={assignment.user.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[8px] font-bold text-ip-on-surface-variant">{getInitials(assignment.user.name)}</span>
                                      )}
                                    </div>
                                  ) : null)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col w-10 shrink-0 bg-ip-surface-container-low rounded-xl border border-ip-outline-variant overflow-hidden h-full opacity-60 cursor-pointer">
                    <div className="p-2 border-b border-ip-outline-variant bg-ip-surface-container-low flex flex-col items-center gap-2 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-ip-outline-variant mt-1"></span>
                      <h3 className="font-bold text-[11px] uppercase tracking-widest text-ip-on-surface-variant mt-2" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>Closed</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* List View */}
              {activeTab === 'List' && (
                <div className="overflow-x-auto rounded-lg border border-ip-outline-variant">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ip-surface-container-low border-b border-ip-outline-variant">
                        <th className="px-4 py-2.5 text-[10px] font-bold tracking-wider uppercase text-ip-on-surface-variant">Task</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold tracking-wider uppercase text-ip-on-surface-variant">Status</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold tracking-wider uppercase text-ip-on-surface-variant">Priority</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold tracking-wider uppercase text-ip-on-surface-variant">Due</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold tracking-wider uppercase text-ip-on-surface-variant">Assignee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ip-outline-variant/50">
                      {tasks.map(task => (
                        <tr key={task.id} className="hover:bg-ip-surface-container-lowest transition-colors text-[13px]">
                          <td className="px-4 py-3 font-semibold text-ip-on-surface">{task.title}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm ${taskStatusColors[task.status] || 'bg-ip-surface-variant text-ip-on-surface-variant'}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm bg-ip-secondary-container text-ip-on-secondary-container">
                              {task.priority || 'Med'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-ip-on-surface-variant text-[12px]">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {task.assignments && task.assignments.length > 0 ? (
                                task.assignments.map((assignment: any) => (
                                  <div key={assignment.user.id} className="flex items-center gap-1 bg-ip-surface-container px-1.5 py-0.5 rounded-full border border-ip-outline-variant/30">
                                    <div className="w-4 h-4 rounded-full bg-ip-surface-container-high border border-ip-outline-variant flex items-center justify-center overflow-hidden">
                                      {assignment.user.avatarUrl ? (
                                        <img src={getAvatarUrl(assignment.user.avatarUrl) || ''} alt={assignment.user.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[7px] font-bold text-ip-on-surface-variant">{getInitials(assignment.user.name)}</span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-medium text-ip-on-surface">{assignment.user.name}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-ip-on-surface-variant italic text-[11px]">Unassigned</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tasks.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-ip-on-surface-variant italic">No tasks found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================= */}
        {/* RIGHT COLUMN: SIDE PANEL*/}
        {/* ======================= */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Project Details */}
          <div className="bg-ip-surface-container-lowest p-5 rounded-2xl border border-ip-outline-variant shadow-sm space-y-4">
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-ip-on-surface-variant mb-1.5 flex items-center gap-1.5">
                <FileText size={12} /> Description
              </h3>
              <p className="text-[13px] text-ip-on-surface leading-relaxed">
                {project.description || <span className="italic text-ip-on-surface-variant">No description provided.</span>}
              </p>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ip-on-surface-variant mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-ip-surface-container border border-ip-outline-variant rounded-md text-[10px] font-bold text-ip-on-surface-variant">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-ip-outline-variant/50">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-ip-outline mb-1">Visibility</h3>
                <span className="flex items-center gap-1 text-[12px] font-bold text-ip-on-surface">
                  {project.visibility === 'PRIVATE' ? <Lock size={12} className="text-ip-on-surface-variant" /> : <Globe size={12} className="text-ip-primary" />}
                  {project.visibility === 'PRIVATE' ? 'Private' : 'Public'}
                </span>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-ip-outline mb-1">Deadline</h3>
                <span className="flex items-center gap-1 text-[12px] font-bold text-ip-on-surface">
                  <Calendar size={12} className="text-ip-primary" />
                  {project.estimatedCompletionDate ? new Date(project.estimatedCompletionDate).toLocaleDateString() : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Core Team */}
          <div className="bg-ip-surface-container-lowest p-5 rounded-2xl border border-ip-outline-variant shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-ip-on-surface flex items-center gap-2">
                <Users className="text-ip-on-surface-variant" size={16} /> Core Team
              </h3>
              {isManagerOrAdmin && (
                <button onClick={() => setManageTeamOpen(true)} className="text-[11px] font-bold text-ip-primary hover:underline">Manage</button>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {project.members?.map(member => {
                const u = member.user;
                const avatarUrl = getAvatarUrl(u?.avatarUrl);
                return (
                  <div key={member.userId} className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={u?.name} className="w-8 h-8 rounded-full object-cover border border-ip-outline-variant" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ip-primary/80 to-ip-primary text-ip-on-primary flex items-center justify-center font-bold text-[10px]">
                        {getInitials(u?.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-ip-on-surface text-[13px] truncate">{u?.name}</div>
                      <div className="text-[11px] text-ip-on-surface-variant font-medium truncate">
                        {u?.role === 'Admin' ? 'Project Lead' : u?.role === 'ProjectManager' ? 'Manager' : 'Engineer'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Documents */}
          <div className="bg-ip-surface-container-lowest p-5 rounded-2xl border border-ip-outline-variant shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-ip-on-surface flex items-center gap-2">
                <FileText className="text-ip-on-surface-variant" size={16} /> Documents
              </h3>
              <button className="text-ip-primary hover:text-ip-on-primary-fixed-variant transition-colors">
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
                    return 'bg-ip-surface-container-high text-ip-on-surface-variant border-ip-outline-variant';
                  };
                  return (
                    <a key={doc.id || i} href={getAvatarUrl(doc.fileUrl) || '#'} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 group cursor-pointer bg-ip-surface hover:bg-ip-surface-container-low border border-transparent hover:border-ip-outline-variant transition-colors p-1.5 -mx-1.5 rounded-lg">
                      <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${getFileColor(doc.fileType)}`}>
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-ip-on-surface text-[12px] group-hover:text-ip-primary transition-colors truncate">
                          {doc.fileName}
                        </div>
                        <div className="text-[10px] font-medium text-ip-outline mt-0.5 font-mono">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="text-[12px] text-ip-on-surface-variant italic py-2 text-center bg-ip-surface-container rounded-lg border border-dashed border-ip-outline-variant">No documents</div>
              )}
            </div>
          </div>

          {/* External Links */}
          <div className="bg-ip-surface-container-lowest p-5 rounded-2xl border border-ip-outline-variant shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-ip-on-surface flex items-center gap-2">
                <LinkIcon className="text-ip-on-surface-variant" size={16} /> Links
              </h3>
              <button className="text-ip-primary hover:text-ip-on-primary-fixed-variant transition-colors">
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
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="border border-ip-outline-variant rounded-lg p-2.5 flex items-center gap-3 hover:border-ip-primary/40 hover:bg-ip-surface-container-lowest cursor-pointer transition-all group">
                      <div className="w-7 h-7 rounded bg-ip-surface-container-high flex items-center justify-center text-ip-on-surface-variant group-hover:text-ip-primary transition-colors shrink-0">
                        <ExternalLink size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-ip-on-surface text-[12px] truncate">{title}</div>
                        <div className="text-[10px] text-ip-on-surface-variant truncate mt-0.5">{url}</div>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="text-[12px] text-ip-on-surface-variant italic py-2 text-center bg-ip-surface-container rounded-lg border border-dashed border-ip-outline-variant">No links</div>
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
