'use client';

import { useState, useEffect } from 'react';
import { useKanbanStore } from '@/lib/data/store';
import { Task, TaskStatus } from '@/lib/data/types';
import { downloadCSV } from '@/lib/data/csv';
import { Column } from '@/components/Column';
import { TaskDialog } from '@/components/TaskDialog';
import { TaskList } from '@/components/TaskList';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List, Download, RefreshCw, BarChart, Users } from 'lucide-react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

export default function Home() {
  const {
    board,
    view,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    setView,
  } = useKanbanStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    })
  );

  // Flatten the tasks for the list view
  const allTasks = board.columns.flatMap(column => column.tasks);

  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    
    if (activeData?.type === 'task') {
      setActiveTask(activeData.task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    // If the task is dragged over a column
    if (active.data.current?.type === 'task' && over.data.current?.type === 'column') {
      const task = active.data.current.task;
      const targetColumnId = over.id as TaskStatus;
      
      if (task.status !== targetColumnId) {
        moveTask(task.project_id, targetColumnId);
      }
    }
  };

  // Task management functions
  const handleAddTask = (status: TaskStatus) => {
    setNewTaskStatus(status);
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'project_id' | 'created' | 'updated'>) => {
    if (editingTask) {
      await updateTask(editingTask.project_id, taskData);
    } else {
      await addTask(taskData);
    }
    setDialogOpen(false);
  };

  // CSV export function
  const handleExportCSV = () => {
    downloadCSV(allTasks, 'kanban-tasks.csv');
  };

  // Handle refresh button
  const handleRefresh = () => {
    fetchTasks();
  };

  return (
    <main className="flex flex-col h-screen p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={view === 'board' ? 'default' : 'outline'}
              className="rounded-none flex items-center gap-1 border-0"
              onClick={() => setView('board')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Board</span>
            </Button>
            <Button 
              variant={view === 'list' ? 'default' : 'outline'}
              className="rounded-none flex items-center gap-1 border-0"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/teams">
            <Button variant="outline" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Teams</span>
            </Button>
          </Link>
          <Button onClick={() => handleAddTask('todo')} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {loading && !error ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {view === 'board' ? (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
            >
              <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
                {board.columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={column.tasks}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={deleteTask}
                  />
                ))}
              </div>
            </DndContext>
          ) : (
            <TaskList
              tasks={allTasks}
              onEditTask={handleEditTask}
              onDeleteTask={deleteTask}
            />
          )}
        </>
      )}

      <TaskDialog
        isOpen={dialogOpen}
        initialTask={editingTask || undefined}
        initialStatus={newTaskStatus}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveTask}
      />
    </main>
  );
}
