import { useState, useEffect } from 'react';
import api from '../lib/axios';
import type { Task } from '../types/index';

type StatusFilter = 'All' | 'ToDo' | 'InProgress' | 'Completed';
type PriorityFilter = 'All' | 'Low' | 'Medium' | 'High';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');

  useEffect(() => {
    api.get<Task[]>('/tasks')
      .then(res => setTasks(res.data))
      .catch(() => setError('Failed to load tasks.'))
      .finally(() => setLoading(false));
  }, []);

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
    transition: 'all 0.2s',
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 4px' }}>Tasks</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Track and manage all tasks</p>
        </div>
        {/* Tharushan: place <CreateTaskButton /> here */}
      </div>

      {/* Filters */}
      <div style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>

        {/* Status Filter */}
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

        {/* Priority Filter */}
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

      {/* Loading */}
      {loading && <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading tasks...</div>}

      {/* Error */}
      {error && (
        <div style={{ background: '#2d1515', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div style={{ background: '#111111', border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f1f1f' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Task</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Priority</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                    {tasks.length === 0 ? 'No tasks found. Backend not connected yet.' : 'No tasks match the selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, index) => {
                  const statusStyle = getStatusColor(task.status);
                  const priorityStyle = getPriorityColor(task.priority);
                  return (
                    <tr key={task.id} style={{ borderBottom: index < filteredTasks.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tharushan: place <KanbanBoard /> here */}
      {/* Tharushan: place <TaskDetailModal /> here */}
    </div>
  );
}