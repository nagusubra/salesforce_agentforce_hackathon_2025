import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the workplace configuration JSON file
    const filePath = path.join(process.cwd(), 'data', 'workplace_config.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Return the configuration as JSON
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error loading workplace configuration:', error);
    return NextResponse.json(
      { error: 'Failed to load workplace configuration' },
      { status: 500 }
    );
  }
}