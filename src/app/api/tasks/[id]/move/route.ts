import { NextResponse } from 'next/server';
import { moveTask } from '@/lib/data/csvDatabase';
import { TaskStatus } from '@/lib/data/types';

interface Params {
  params: {
    id: string;
  };
}

// PATCH /api/tasks/[id]/move - Move a task to a different status
export async function PATCH(request: Request, context: Params) {
  try {
    // Await params before accessing properties
    const params = await context.params;
    const id = params.id;
    const { status } = await request.json();
    
    // Validate status
    if (!status || !['todo', 'in-progress', 'done'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (todo, in-progress, done)' },
        { status: 400 }
      );
    }
    
    const updatedTask = await moveTask(id, status as TaskStatus);
    
    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json(
      { error: 'Failed to move task' },
      { status: 500 }
    );
  }
}