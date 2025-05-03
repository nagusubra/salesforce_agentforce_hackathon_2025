import { Task } from '@/lib/data/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, onEditTask, onDeleteTask }: TaskListProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 hover:bg-blue-200 text-blue-800';
      case 'done':
        return 'bg-green-100 hover:bg-green-200 text-green-800';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="w-full">
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Ticket ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Project</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Deadline</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Assignee</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.project_id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                        {task.description}
                      </div>
                    )}
                    {task.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.required_skills.slice(0, 2).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {task.required_skills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.required_skills.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    #{task.ticket_id}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {task.project_name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {task.deadline ? format(new Date(task.deadline), 'MM/dd/yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {task.members.length > 0 ? task.members[0] : '-'}
                    {task.members.length > 1 && ` +${task.members.length - 1}`}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => onEditTask(task)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDeleteTask(task.project_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}