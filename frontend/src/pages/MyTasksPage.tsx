import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import KanbanBoard from '@/features/tasks/components/KanbanBoard';
import TaskTable from '@/features/tasks/components/TaskTable';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import type { TaskWithDetails } from '@/features/tasks/hooks/useTasks';

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
        <h3 className="text-base font-semibold text-foreground">{monthName} {year}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setDate(new Date(year, month - 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setDate(new Date(year, month + 1, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-[11px] font-semibold text-muted-foreground text-center py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="bg-muted/50 min-h-[72px]" />;
          const cellDate = new Date(year, month, day);
          const isToday = cellDate.toDateString() === today.toDateString();
          const dayTasks = tasksByDate[cellDate.toDateString()] ?? [];

          return (
            <div
              key={day}
              className={`bg-card min-h-[72px] p-1.5 ${isToday ? 'ring-2 ring-inset ring-primary' : ''}`}
            >
              <span className={`text-xs font-semibold inline-flex w-5 h-5 items-center justify-center rounded-full ${
                isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}>
                {day}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {dayTasks.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className="text-[10px] font-medium px-1 py-0.5 rounded bg-secondary text-foreground truncate"
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 2} more</div>
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
  const [searchParams] = useSearchParams();
  
  const tab = searchParams.get('tab') || 'list';
  const projectId = 'me'; // 'me' triggers /api/tasks/me to fetch all user's tasks

  return (
    <div className="font-jakarta max-w-[1600px] w-full mx-auto">
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">My Tasks</h2>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 hover:text-primary/90 transition-colors shadow-[0_2px_8px_rgba(70,72,212,0.25)] flex items-center gap-1.5">
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {tab === 'list'     && <TaskTable   projectId={projectId} />}
        {tab === 'board'    && <KanbanBoard projectId={projectId} />}
        {tab === 'calendar' && <CalendarView projectId={projectId} />}
      </div>
    </div>
  );
}
