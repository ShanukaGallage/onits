import {
  DndContext,
  DragOverlay,
} from '@dnd-kit/core';

import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';

import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import {
  useTasks,
  useUpdateTaskStatus,
  type TaskWithDetails,
} from '../hooks/useTasks';

import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({
  projectId,
}: KanbanBoardProps) {
  const {
    data: tasks = [],
    isLoading,
  } = useTasks(projectId);

  const updateTaskStatus =
    useUpdateTaskStatus();

  const [activeTask, setActiveTask] =
    useState<TaskWithDetails | null>(null);

  const todoTasks = tasks.filter(
    (task) => task.status === 'ToDo'
  );

  const inProgressTasks = tasks.filter(
    (task) =>
      task.status === 'InProgress'
  );

  const completedTasks = tasks.filter(
    (task) =>
      task.status === 'Completed'
  );

  const handleDragStart = (
    event: DragStartEvent
) => {
    const task = tasks.find(
      (t) => t.id === event.active.id
    );

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (
    event: DragEndEvent
  ) => {
    setActiveTask(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const task = tasks.find(
      (t) => t.id === active.id
    );

    if (!task) {
      return;
    }

    const newStatus =
      over.id as
        | 'ToDo'
        | 'InProgress'
        | 'Completed';

    if (task.status === newStatus) {
      return;
    }

    updateTaskStatus.mutate({
      taskId: String(active.id),
      status: newStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {[1, 2, 3].map((column) => (
          <div
            key={column}
            className="flex-1 space-y-3"
          >
            <Skeleton className="h-8 w-32" />

            {[1, 2, 3].map((card) => (
              <Skeleton
                key={card}
                className="h-24 w-full"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        <KanbanColumn
          title="To Do"
          status="ToDo"
          tasks={todoTasks}
        />

        <KanbanColumn
          title="In Progress"
          status="InProgress"
          tasks={inProgressTasks}
        />

        <KanbanColumn
          title="Completed"
          status="Completed"
          tasks={completedTasks}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rounded-md border bg-background p-3 shadow-xl">
            {activeTask.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}