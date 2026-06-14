import { useState } from 'react';
import { useTasks, useDeleteTask } from '../hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskTableProps {
  projectId: string;
}

export default function TaskTable({ projectId }: TaskTableProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('_all');
  const [priority, setPriority] = useState<string>('_all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: tasks = [], isLoading } = useTasks(projectId, {
    status: status === '_all' ? undefined : (status as any),
    priority: priority === '_all' ? undefined : (priority as any),
    sortBy,
    sortOrder,
  });

  const deleteTask = useDeleteTask();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 ml-1 text-neutral-600" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1 text-indigo-400" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-indigo-400" />
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" />;
      case 'InProgress': return <Clock className="w-4 h-4 text-amber-400 mr-1.5" />;
      default: return <AlertCircle className="w-4 h-4 text-neutral-400 mr-1.5" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-neutral-900 animate-pulse rounded-md w-[300px]" />
        <div className="h-64 bg-neutral-900 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-800">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Statuses</SelectItem>
            <SelectItem value="ToDo">To Do</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-800">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-900/50 border-b border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider">
              <tr>
                <th 
                  className="px-4 py-3 font-medium cursor-pointer hover:bg-neutral-800/50 transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">Title {getSortIcon('title')}</div>
                </th>
                <th 
                  className="px-4 py-3 font-medium cursor-pointer hover:bg-neutral-800/50 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">Status {getSortIcon('status')}</div>
                </th>
                <th 
                  className="px-4 py-3 font-medium cursor-pointer hover:bg-neutral-800/50 transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center">Priority {getSortIcon('priority')}</div>
                </th>
                <th 
                  className="px-4 py-3 font-medium cursor-pointer hover:bg-neutral-800/50 transition-colors"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center">Due Date {getSortIcon('dueDate')}</div>
                </th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-neutral-900/30 transition-colors group">
                    <td className="px-4 py-3 font-medium text-neutral-200">
                      {task.title}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-neutral-300 font-medium">
                        {getStatusIcon(task.status)}
                        {task.status.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getPriorityBadge(task.priority)}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {task.dueDate ? (
                        <div className="flex items-center text-neutral-400">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      ) : (
                        <span className="text-neutral-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(user?.role === 'Admin' || user?.role === 'ProjectManager') && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this task?')) {
                              deleteTask.mutate(task.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}