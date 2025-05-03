import { NextResponse } from 'next/server';
import { getAllTasks, getTasksByColumns, createTask } from '@/lib/data/csvDatabase';
import { Task } from '@/lib/data/types';

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const columns = await getTasksByColumns();
    return NextResponse.json({ columns }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.status) {
      return NextResponse.json(
        { error: 'Title and status are required' },
        { status: 400 }
      );
    }

    const taskData: Omit<Task, 'project_id' | 'ticket_id' | 'created' | 'updated'> = {
      user_id: body.user_id || '',
      project_name: body.project_name || '',
      title: body.title,
      description: body.description,
      required_skills: body.required_skills || [],
      priority: body.priority || 'medium',
      status: body.status,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      members_needed: body.members_needed || [],
      members: body.members || [],
    };

    const newTask = await createTask(taskData);
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}