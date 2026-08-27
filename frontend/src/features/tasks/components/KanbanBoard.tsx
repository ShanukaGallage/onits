import {
  DndContext,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Archive } from 'lucide-react';

import {
  useTasks,
  useUpdateTaskStatus,
  type TaskWithDetails,
} from '../hooks/useTasks';
import { useRealtimeTasks } from '../hooks/useRealtimeTasks';

import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  useRealtimeTasks(projectId);
  const { data: rawTasks = [], isLoading } = useTasks(projectId);
  const updateTaskStatus = useUpdateTaskStatus();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  const tasks = rawTasks.filter(t => 
    !searchQuery || 
    t.title.toLowerCase().includes(searchQuery) ||
    t.description?.toLowerCase().includes(searchQuery)
  );

  const [activeTask, setActiveTask] = useState<TaskWithDetails | null>(null);

  const todoTasks = tasks.filter((task) => task.status === 'ToDo');
  const inProgressTasks = tasks.filter((task) => task.status === 'InProgress');
  const completedTasks = tasks.filter((task) => task.status === 'Completed');

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const newStatus = over.id as 'ToDo' | 'InProgress' | 'Completed';
    if (task.status === newStatus) return;

    updateTaskStatus.mutate({
      taskId: String(active.id),
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[1, 2, 3].map((column) => (
          <div key={column} className="w-[320px] space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex-1 overflow-x-auto overflow-y-hidden kanban-board -mx-6 px-6">
        <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px] min-w-max pb-4">
          
          <KanbanColumn
            title="To Do"
            status="ToDo"
            tasks={todoTasks}
            dotColor="bg-primary opacity-80"
          />

          <KanbanColumn
            title="In Progress"
            status="InProgress"
            tasks={inProgressTasks}
            dotColor="bg-primary/20 animate-pulse"
          />

          <KanbanColumn
            title="Done / Review"
            status="Completed"
            tasks={completedTasks}
            dotColor="bg-[#10b981]"
          />

          {/* Closed / Archived Column */}
          <div className="w-[60px] flex flex-col h-full bg-card border-y border-r border-border/50 rounded-r-xl border-l-0 hover:w-[320px] transition-all duration-300 group overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col items-center pt-4 opacity-100 group-hover:opacity-0 transition-opacity duration-200">
              <Archive className="text-muted-foreground mb-4 w-5 h-5" />
              <div className="[writing-mode:vertical-rl] transform rotate-180 text-[12px] font-bold text-muted-foreground whitespace-nowrap tracking-widest uppercase">
                CLOSED (0)
              </div>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[320px] p-2 h-full flex flex-col delay-100">
              <div className="flex justify-between items-center mb-3 px-2 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <h3 className="text-base font-bold text-muted-foreground">Closed</h3>
                  <span className="bg-muted text-muted-foreground text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">0</span>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground italic">Expand to view archived tasks.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-2 scale-105 transition-transform origin-center w-[320px]">
            <KanbanCard task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}