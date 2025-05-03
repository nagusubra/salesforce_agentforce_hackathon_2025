'use client';

import Link from 'next/link';
import { 
  Activity, 
  PieChart, 
  Clock, 
  FileText, 
  Timer as TimerIcon, 
  ArrowLeft,
  LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const reportCards = [
  {
    title: 'Average Age Report',
    description: 'Shows the average age of unresolved tasks. Helps identify stale tasks that need attention.',
    icon: <Clock className="h-8 w-8 text-muted-foreground" />,
  },
  {
    title: 'Created vs. Resolved Tasks',
    description: 'Tracks tasks created vs. completed over time. Visualizes team productivity and workload balance.',
    icon: <Activity className="h-8 w-8 text-muted-foreground" />,
  },
  {
    title: 'Task Distribution Pie Chart',
    description: 'Visualizes task types or statuses via a pie chart. Understand how work is distributed across different categories.',
    icon: <PieChart className="h-8 w-8 text-muted-foreground" />,
  },
  {
    title: 'Recently Created Tasks Report',
    description: 'Shows task creation trends and closure rates. Helps identify peak workload periods and project momentum.',
    icon: <FileText className="h-8 w-8 text-muted-foreground" />,
  },
  {
    title: 'Timeline Overview',
    description: 'Placeholder for future timeline visualizations. Will provide comprehensive project milestones and deadlines.',
    icon: <TimerIcon className="h-8 w-8 text-muted-foreground" />,
  },
  {
    title: 'Task Velocity Chart',
    description: 'Track how quickly tasks are moving through different statuses. Identify workflow bottlenecks.',
    icon: <LineChart className="h-8 w-8 text-muted-foreground" />,
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to board</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Dashboard &amp; Reports</h1>
      </div>
      
      <p className="text-muted-foreground mb-8 max-w-2xl">
        View key metrics and insights about your projects and tasks. These reports help track productivity,
        identify bottlenecks, and make data-driven decisions.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((card, index) => (
          <Card key={index} className="flex flex-col transition-all hover:shadow-md">
            <CardHeader>
              <div className="mb-2">{card.icon}</div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button variant="outline" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}