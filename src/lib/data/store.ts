import { create } from 'zustand';
import { Task, TaskStatus, Board, Column } from './types';

interface KanbanStore {
  board: Board;
  view: 'board' | 'list';
  loading: boolean;
  error: string | null;
  
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'project_id' | 'ticket_id' | 'created' | 'updated'>) => Promise<void>;
  updateTask: (taskId: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  setView: (view: 'board' | 'list') => void;
}

// Initial state 
const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'in-progress', title: 'In Progress', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  board: {
    columns: initialColumns,
  },
  view: 'board',
  loading: false,
  error: null,
  
  // Fetch all tasks from the API
  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      set({ 
        board: data,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        loading: false 
      });
    }
  },
  
  // Add a new task
  addTask: async (task) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      
      // Refresh tasks to get the updated list
      await get().fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add task',
        loading: false 
      });
    }
  },
  
  // Update an existing task
  updateTask: async (taskId, updatedTaskData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTaskData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      // Refresh tasks to get the updated list
      await get().fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task',
        loading: false 
      });
    }
  },
  
  // Delete a task
  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Refresh tasks to get the updated list
      await get().fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete task',
        loading: false 
      });
    }
  },
  
  // Move a task to a different column
  moveTask: async (taskId, newStatus) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to move task');
      }
      
      // Refresh tasks to get the updated list
      await get().fetchTasks();
    } catch (error) {
      console.error('Error moving task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to move task',
        loading: false 
      });
    }
  },
  
  // Toggle between board and list views
  setView: (view) => set({ view }),
}));