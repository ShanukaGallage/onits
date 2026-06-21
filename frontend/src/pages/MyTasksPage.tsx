import { useState } from 'react';
import { List, LayoutDashboard, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import KanbanBoard from '@/features/tasks/components/KanbanBoard';
import TaskTable from '@/features/tasks/components/TaskTable';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import type { TaskWithDetails } from '@/features/tasks/hooks/useTasks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

type Tab = 'list' | 'board' | 'calendar';

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-ip-base text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-ip-primary text-ip-on-primary shadow-[0_2px_8px_rgba(70,72,212,0.25)]'
          : 'text-ip-on-surface-variant hover:bg-ip-surface-container-low hover:text-ip-on-surface'
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

// ─── Calendar View ─────────────────────────────────────────────────────────────
function CalendarView({ projectId }: { projectId: string }) {
  const { data: tasks } = useTasks(projectId);
  const [date, setDate] = useState(new Date());

  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString('default', { month: 'long' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group tasks by due date
  const tasksByDate: Record<string, TaskWithDetails[]> = {};
  tasks?.forEach((task) => {
    if (!task.dueDate) return;
    const key = new Date(task.dueDate).toDateString();
    tasksByDate[key] = tasksByDate[key] ? [...tasksByDate[key], task] : [task];
  });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-ip-on-surface">{monthName} {year}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setDate(new Date(year, month - 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-ip-base hover:bg-ip-surface-container-low transition-colors text-ip-on-surface-variant"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setDate(new Date(year, month + 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-ip-base hover:bg-ip-surface-container-low transition-colors text-ip-on-surface-variant"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-[11px] font-semibold text-ip-on-surface-variant text-center py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-ip-outline-variant rounded-ip-lg overflow-hidden">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="bg-ip-surface-container-low min-h-[72px]" />;
          const cellDate = new Date(year, month, day);
          const isToday = cellDate.toDateString() === today.toDateString();
          const dayTasks = tasksByDate[cellDate.toDateString()] ?? [];

          return (
            <div
              key={day}
              className={`bg-ip-surface-container-lowest min-h-[72px] p-1.5 ${isToday ? 'ring-2 ring-inset ring-ip-primary' : ''}`}
            >
              <span className={`text-xs font-semibold inline-flex w-5 h-5 items-center justify-center rounded-full ${
                isToday ? 'bg-ip-primary text-ip-on-primary' : 'text-ip-on-surface-variant'
              }`}>
                {day}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {dayTasks.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className="text-[10px] font-medium px-1 py-0.5 rounded bg-ip-secondary-container text-ip-on-surface truncate"
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[10px] text-ip-on-surface-variant px-1">+{dayTasks.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyTasksPage() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const [tab, setTab] = useState<Tab>('list');
  const [projectId, setProjectId] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ip-primary" />
      </div>
    );
  }

  return (
    <div className="font-jakarta space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-bold text-ip-on-surface tracking-tight">My Tasks</h1>
        <p className="text-sm text-ip-on-surface-variant mt-1">
          Tasks across all your projects, {user?.name?.split(' ')[0]}.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-ip-surface-container-low border border-ip-outline-variant rounded-ip-base">
          <TabBtn active={tab === 'list'}     onClick={() => setTab('list')}     icon={List}            label="List" />
          <TabBtn active={tab === 'board'}    onClick={() => setTab('board')}    icon={LayoutDashboard} label="Board" />
          <TabBtn active={tab === 'calendar'} onClick={() => setTab('calendar')} icon={CalendarIcon}    label="Calendar" />
        </div>

        {/* Project selector */}
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-[220px] bg-ip-surface-container-lowest border-ip-outline-variant text-ip-on-surface text-sm rounded-ip-base">
            <SelectValue placeholder="Select a project…" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {!projectId ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-ip-outline-variant rounded-ip-lg text-ip-on-surface-variant bg-ip-surface-container-lowest">
          <List size={28} className="mb-3 opacity-30" />
          <p className="text-sm font-medium">Select a project to view tasks</p>
          <p className="text-xs mt-1 opacity-60">Use the dropdown above to choose a project</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {tab === 'list'     && <TaskTable   projectId={projectId} />}
          {tab === 'board'    && <KanbanBoard projectId={projectId} />}
          {tab === 'calendar' && <CalendarView projectId={projectId} />}
        </div>
      )}
    </div>
  );
}
