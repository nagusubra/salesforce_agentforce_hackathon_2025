import { Task } from './types';

// Helper function to safely convert Date to ISO string
function safeToISOString(date: Date | undefined | null): string {
  if (!date) return '';
  
  try {
    return date.toISOString();
  } catch (e) {
    console.warn('Invalid date encountered:', date);
    // Return current date as fallback
    return new Date().toISOString();
  }
}

// Function to convert tasks to CSV format
export function tasksToCSV(tasks: Task[]): string {
  // Define headers with the new column structure
  const headers = [
    'project_id',
    'ticket_id',
    'user_id',
    'project_name',
    'title',
    'description',
    'required_skills',
    'priority',
    'status',
    'deadline',
    'members_needed',
    'members',
    'created',
    'updated'
  ];
  
  // Map tasks to CSV rows
  const rows = tasks.map(task => [
    task.project_id,
    task.ticket_id,
    task.user_id,
    `"${task.project_name.replace(/"/g, '""')}"`,
    `"${task.title.replace(/"/g, '""')}"`,
    // Properly escape newlines and quotes in descriptions
    task.description ? `"${task.description.replace(/"/g, '""').replace(/\n/g, '\\n')}"` : '',
    `"${task.required_skills.join(';').replace(/"/g, '""')}"`,
    task.priority,
    task.status,
    task.deadline ? safeToISOString(task.deadline) : '',
    `"${task.members_needed.join(';').replace(/"/g, '""')}"`,
    `"${task.members.join(';').replace(/"/g, '""')}"`,
    safeToISOString(task.created),
    safeToISOString(task.updated)
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

// Function to parse CSV into tasks
export function csvToTasks(csv: string): Partial<Task>[] {
  // Split into lines and remove header
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  // Skip header and parse rows
  return lines.slice(1).map(line => {
    // Handle quoted fields correctly
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Check for escaped quotes
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current); // Add last field
    
    // Parse arrays from semicolon-separated strings
    const parseArray = (str: string) => {
      if (!str) return [];
      return str.split(';').filter(Boolean);
    };
    
    // Restore escaped newlines in description
    let description = fields[4] || undefined;
    if (description) {
      description = description.replace(/\\n/g, '\n');
    }
    
    // Create task object from fields
    return {
      project_id: fields[0],
      ticket_id: fields[1],
      user_id: fields[2],
      project_name: fields[3],
      title: fields[4],
      description: fields[5] ? fields[5].replace(/\\n/g, '\n') : undefined,
      required_skills: parseArray(fields[6]),
      priority: fields[7],
      status: fields[8],
      deadline: fields[9] ? new Date(fields[9]) : undefined,
      members_needed: parseArray(fields[10]),
      members: parseArray(fields[11]),
      created: new Date(fields[12]),
      updated: new Date(fields[13])
    };
  });
}

// Function to download the CSV file
export function downloadCSV(tasks: Task[], filename = 'kanban-tasks.csv'): void {
  const csvContent = tasksToCSV(tasks);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}