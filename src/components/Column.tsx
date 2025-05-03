import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType, Task } from '@/lib/data/types';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (status: ColumnType['id']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function Column({ column, tasks, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  return (
    <div className="flex flex-col rounded-md bg-gray-50 dark:bg-gray-800/50 w-80 h-full">
      <div className="p-3 font-medium flex items-center justify-between border-b">
        <h3>{column.title} <span className="text-gray-400 text-sm ml-1">({tasks.length})</span></h3>
        <Button size="sm" variant="ghost" onClick={() => onAddTask(column.id)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 p-2 overflow-y-auto"
      >
        <SortableContext
          items={tasks.map(task => task.project_id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.project_id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}

          {tasks.length === 0 && (
            <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
              No tasks
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}