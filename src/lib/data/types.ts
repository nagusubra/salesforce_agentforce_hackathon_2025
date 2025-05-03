export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Task {
  project_id: string;
  ticket_id: string;
  user_id: string;
  project_name: string;
  title: string;
  description?: string;
  required_skills: string[];
  priority: PriorityLevel;
  status: TaskStatus;
  deadline?: Date;
  members_needed: string[];
  members: string[];
  created: Date;
  updated: Date;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface Board {
  columns: Column[];
}