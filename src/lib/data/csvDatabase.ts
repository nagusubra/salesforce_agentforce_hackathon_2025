import { Task, TaskStatus, Column } from './types';
import fs from 'fs';
import path from 'path';
import { csvToTasks, tasksToCSV } from './csv';

// Define the path to the CSV file
const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.csv');

// Ensure the CSV file exists with headers
const initializeCSVFile = () => {
  // Check if the file exists
  if (!fs.existsSync(CSV_FILE_PATH)) {
    // Create headers for the CSV file
    const headers = 'project_id,ticket_id,user_id,project_name,title,description,required_skills,priority,status,deadline,members_needed,members,created,updated\n';
    fs.writeFileSync(CSV_FILE_PATH, headers);
  }
};

// Read all tasks from the CSV file
export const readTasksFromCSV = async (): Promise<Task[]> => {
  try {
    initializeCSVFile();
    
    const data = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    if (!data.trim() || data.trim() === 'project_id,user_id,project_name,title,description,required_skills,priority,status,deadline,members_needed,members,created,updated') {
      return [];
    }
    
    const tasks = csvToTasks(data);
    return tasks.map(task => ({
      project_id: task.project_id!,
      ticket_id: task.ticket_id!,
      user_id: task.user_id!,
      project_name: task.project_name!,
      title: task.title!,
      description: task.description,
      required_skills: task.required_skills || [],
      priority: task.priority || 'medium',
      status: task.status!,
      deadline: task.deadline,
      members_needed: task.members_needed || [],
      members: task.members || [],
      created: task.created || new Date(),
      updated: task.updated || new Date()
    }));
  } catch (error) {
    console.error('Error reading tasks from CSV:', error);
    return [];
  }
};

// Write tasks to the CSV file
export const writeTasksToCSV = async (tasks: Task[]): Promise<void> => {
  try {
    const csvContent = tasksToCSV(tasks);
    fs.writeFileSync(CSV_FILE_PATH, csvContent);
  } catch (error) {
    console.error('Error writing tasks to CSV:', error);
  }
};

// CRUD operations

// Create a new task
export const createTask = async (taskData: Omit<Task, 'project_id' | 'ticket_id' | 'created' | 'updated'>): Promise<Task> => {
  const tasks = await readTasksFromCSV();
  
  // Generate a new project ID
  const newId = Math.random().toString(36).substring(2, 10);
  
  // Generate a new ticket ID (incrementing from the last one)
  let lastTicketNum = 0;
  tasks.forEach(task => {
    const ticketNum = parseInt(task.ticket_id || '0');
    if (!isNaN(ticketNum) && ticketNum > lastTicketNum) {
      lastTicketNum = ticketNum;
    }
  });
  const newTicketId = String(lastTicketNum + 1).padStart(4, '0');
  
  const newTask: Task = {
    project_id: newId,
    ticket_id: newTicketId,
    ...taskData,
    created: new Date(),
    updated: new Date()
  };
  
  tasks.push(newTask);
  await writeTasksToCSV(tasks);
  
  return newTask;
};

// Get all tasks
export const getAllTasks = async (): Promise<Task[]> => {
  return await readTasksFromCSV();
};

// Update a task
export const updateTask = async (taskId: string, updatedData: Partial<Task>): Promise<Task | null> => {
  const tasks = await readTasksFromCSV();
  const taskIndex = tasks.findIndex(task => task.project_id === taskId);
  
  if (taskIndex === -1) {
    return null;
  }
  
  const updatedTask: Task = {
    ...tasks[taskIndex],
    ...updatedData,
    updated: new Date()
  };
  
  tasks[taskIndex] = updatedTask;
  await writeTasksToCSV(tasks);
  
  return updatedTask;
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<boolean> => {
  const tasks = await readTasksFromCSV();
  const filteredTasks = tasks.filter(task => task.project_id !== taskId);
  
  if (filteredTasks.length === tasks.length) {
    return false; // No task was deleted
  }
  
  await writeTasksToCSV(filteredTasks);
  return true;
};

// Move a task to a different status
export const moveTask = async (taskId: string, newStatus: TaskStatus): Promise<Task | null> => {
  const tasks = await readTasksFromCSV();
  const taskIndex = tasks.findIndex(task => task.project_id === taskId);
  
  if (taskIndex === -1) {
    return null;
  }
  
  const updatedTask: Task = {
    ...tasks[taskIndex],
    status: newStatus,
    updated: new Date()
  };
  
  tasks[taskIndex] = updatedTask;
  await writeTasksToCSV(tasks);
  
  return updatedTask;
};

// Get tasks grouped by columns
export const getTasksByColumns = async (): Promise<Column[]> => {
  const tasks = await readTasksFromCSV();
  
  const columns: Column[] = [
    { id: 'todo', title: 'To Do', tasks: [] },
    { id: 'in-progress', title: 'In Progress', tasks: [] },
    { id: 'done', title: 'Done', tasks: [] }
  ];
  
  // Group tasks by status
  tasks.forEach(task => {
    const column = columns.find(col => col.id === task.status);
    if (column) {
      column.tasks.push(task);
    }
  });
  
  return columns;
};