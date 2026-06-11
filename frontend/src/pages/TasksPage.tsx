import { useState, useEffect } from 'react';
import { Paperclip, MessageSquare, X, Send, Upload } from 'lucide-react';
import api from '../lib/axios';
import type { Task, Comment, Attachment } from '../types/index';

type StatusFilter = 'All' | 'ToDo' | 'InProgress' | 'Completed';
type PriorityFilter = 'All' | 'Low' | 'Medium' | 'High';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [panelLoading, setPanelLoading] = useState(false);

  useEffect(() => {
    api.get<Task[]>('/tasks')
      .then(res => setTasks(res.data))
      .catch(() => {
        setTasks([
          { id: '1', title: 'Setup frontend routing', description: 'Configure React Router v6', status: 'Completed', priority: 'High', projectId: '1', createdById: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '2', title: 'Build login page', description: 'Dark theme login form', status: 'Completed', priority: 'High', projectId: '1', createdById: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '3', title: 'Dashboard shell', description: 'Stats cards and layout', status: 'InProgress', priority: 'Medium', projectId: '1', createdById: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '4', title: 'Comments panel UI', description: 'Side panel for comments', status: 'ToDo', priority: 'Medium', projectId: '1', createdById: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openPanel = async (task: Task) => {
    setSelectedTask(task);
    setPanelLoading(true);
    try {
      const [commentsRes, attachmentsRes] = await Promise.all([
        api.get<Comment[]>(`/tasks/${task.id}/comments`),
        api.get<Attachment[]>(`/tasks/${task.id}/attachments`),
      ]);
      setComments(commentsRes.data);
      setAttachments(attachmentsRes.data);
    } catch {
      setComments([]);
      setAttachments([]);
    } finally {
      setPanelLoading(false);
    }
  };

  const closePanel = () => {
    setSelectedTask(null);
    setComments([]);
    setAttachments([]);
    setNewComment('');
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    try {
      const res = await api.post<Comment>(`/tasks/${selectedTask.id}/comments`, { content: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch {
      alert('Failed to add comment.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedTask) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post<Attachment>(`/tasks/${selectedTask.id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachments(prev => [...prev, res.data]);
    } catch {
      alert('Failed to upload file.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'All' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'All' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const getStatusColor = (status: string) => {
    if (status === 'ToDo') return { bg: '#1a1a2e', color: '#818cf8' };
    if (status === 'InProgress') return { bg: '#1a2e1a', color: '#34d399' };
    return { bg: '#2e1a2e', color: '#c084fc' };
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return { bg: '#2d1515', color: '#fca5a5' };
    if (priority === 'Medium') return { bg: '#2d2000', color: '#fcd34d' };
    return { bg: '#1a2e1a', color: '#86efac' };
  };

  const filterButtonStyle = (active: boolean) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    background: active ? '#6366f1' : '#1a1a1a',
    color: active ? 'white' : '#6b7280',
  });

  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 4px' }}>Tasks</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Track and manage all tasks</p>
          </div>
        </div>
        <div style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase' }}>Status</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['All', 'ToDo', 'InProgress', 'Completed'] as StatusFilter[]).map(s => (
                <button key={s} style={filterButtonStyle(statusFilter === s)} onClick={() => setStatusFilter(s)}>
                  {s === 'InProgress' ? 'In Progress' : s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase' }}>Priority</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['All', 'Low', 'Medium', 'High'] as PriorityFilter[]).map(p => (
                <button key={p} style={filterButtonStyle(priorityFilter === p)} onClick={() => setPriorityFilter(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading && <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading tasks...</div>}
        {error && <div style={{ background: '#2d1515', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{error}</div>}
        {!loading && (
          <div style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f1f1f' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Task</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Priority</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Due Date</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                      No tasks match filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, index) => {
                    const statusStyle = getStatusColor(task.status);
                    const priorityStyle = getPriorityColor(task.priority);
                    return (
                      <tr key={task.id} style={{ borderBottom: index < filteredTasks.length - 1 ? '1px solid #1a1a1a' : 'none', cursor: 'pointer' }}
                        onClick={() => openPanel(task)}>
                        <td style={{ padding: '16px 20px' }}>
                          <p style={{ color: 'white', fontWeight: '500', margin: '0 0 4px', fontSize: '14px' }}>{task.title}</p>
                          {task.description && <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{task.description}</p>}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                            {task.status === 'InProgress' ? 'In Progress' : task.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: priorityStyle.bg, color: priorityStyle.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                            {task.priority}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#6b7280', fontSize: '14px' }}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); openPanel(task); }}>
                              <MessageSquare size={16} />
                            </button>
                            <button style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); openPanel(task); }}>
                              <Paperclip size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTask && (
        <div style={{ width: '360px', flexShrink: 0, background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 140px)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: 'white', fontWeight: '600', margin: '0 0 2px', fontSize: '14px' }}>{selectedTask.title}</p>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Comments & Attachments</p>
            </div>
            <button onClick={closePanel} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>
          {panelLoading ? (
            <div style={{ padding: '20px', color: '#6b7280', fontSize: '14px' }}>Loading...</div>
          ) : (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f1f1f' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', margin: 0, textTransform: 'uppercase' }}>
                    Attachments ({attachments.length})
                  </p>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#6366f1', fontSize: '12px', fontWeight: '500' }}>
                    <Upload size={14} />
                    Upload
                    <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                  </label>
                </div>
                {attachments.length === 0 ? (
                  <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>No attachments yet.</p>
                ) : (
                  attachments.map(att => (
                    <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#1a1a1a', borderRadius: '8px', marginBottom: '6px' }}>
                      <Paperclip size={14} color="#6b7280" />
                      <a href={att.url} target="_blank" rel="noreferrer" style={{ color: '#818cf8', fontSize: '13px', textDecoration: 'none' }}>{att.filename}</a>
                    </div>
                  ))
                )}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', margin: '0 0 12px', textTransform: 'uppercase' }}>
                  Comments ({comments.length})
                </p>
                {comments.length === 0 ? (
                  <p style={{ color: '#4b5563', fontSize: '13px' }}>No comments yet. Be the first!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '600' }}>U</div>
                        <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{new Date(comment.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p style={{ color: '#d1d5db', fontSize: '14px', margin: '0 0 0 36px', lineHeight: '1.5' }}>{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '16px 20px', borderTop: '1px solid #1f1f1f' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    style={{ flex: 1, padding: '10px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
                  />
                  <button onClick={handleAddComment} style={{ width: '38px', height: '38px', background: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={15} color="white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
