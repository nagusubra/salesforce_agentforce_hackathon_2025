import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Pencil, Trash2, Users } from 'lucide-react';
import { Task } from '@/lib/data/types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.project_id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Priority badge color based on level
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
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="mb-3 cursor-grab active:cursor-grabbing"
      {...attributes} 
      {...listeners}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <CardTitle className="text-base">{task.title}</CardTitle>
          <Badge variant="secondary" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <div>{task.project_name}</div>
          <div>#{task.ticket_id}</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-1 pb-1">
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          {task.required_skills.length > 0 && (
            <div className="w-full">
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
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-2 pt-1 flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500">
          {task.deadline && (
            <div className="flex items-center mr-3" title={format(new Date(task.deadline), 'PPP')}>
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(task.deadline), 'MM/dd')}
            </div>
          )}
          {task.members.length > 0 && (
            <div className="flex items-center" title={`Assigned: ${task.members.join(', ')}`}>
              <Users className="h-3 w-3 mr-1" />
              {task.members.length}
            </div>
          )}
        </div>
        
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(task.project_id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}