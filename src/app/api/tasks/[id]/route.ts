import { NextResponse } from 'next/server';
import { updateTask, deleteTask } from '@/lib/data/csvDatabase';

interface Params {
  params: {
    id: string;
  };
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request: Request, context: Params) {
  try {
    // Await params before accessing properties
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    // Handle date objects from request
    if (body.deadline && typeof body.deadline === 'string') {
      body.deadline = new Date(body.deadline);
    }

    const updatedTask = await updateTask(id, body);
    
    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(_request: Request, context: Params) {
  try {
    // Await params before accessing properties
    const params = await context.params;
    const id = params.id;
    
    const success = await deleteTask(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}