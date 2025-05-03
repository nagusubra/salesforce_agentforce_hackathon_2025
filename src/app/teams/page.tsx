'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building, Users, Briefcase, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Type definitions for workplace configuration
interface WorkingHours {
  [day: string]: [number, number]; // [start hour, end hour]
}

interface Availability {
  timezone: string;
  workingHours: WorkingHours;
}

interface TeamMember {
  employeeId: string;
  name: string;
  designation: string;
  skills: string[];
  hourlyRate: number;
  assignedProjectHours: number;
  availability: Availability;
}

interface TeamManager extends TeamMember {}

interface AssignedResources {
  teamManager: TeamManager;
  teamMembers: TeamMember[];
}

interface RequiredSkills {
  skillsByDesignation: {
    [designation: string]: string[];
  };
  requiredProjectTimeHours: {
    [designation: string]: number;
  };
  totalRequiredHours: number;
}

interface ProjectBudget {
  totalBudgetUSD: number;
  miscellaneousCostUSD: number;
  calculationMethod: string;
}

interface Team {
  teamName: string;
  assigned_resources: AssignedResources;
  required_resources: RequiredSkills;
  projectBudget: ProjectBudget;
}

interface Organization {
  name: string;
  teams: Team[];
}

interface WorkplaceConfig {
  organization: Organization;
}

// Helper function to calculate total assigned hours
const calculateTotalAssignedHours = (team: Team): number => {
  const managerHours = team.assigned_resources.teamManager.assignedProjectHours;
  const memberHours = team.assigned_resources.teamMembers.reduce(
    (sum, member) => sum + member.assignedProjectHours, 
    0
  );
  return managerHours + memberHours;
};

// Helper function to calculate resource utilization by designation
const calculateResourceUtilization = (team: Team) => {
  const required = team.required_resources.requiredProjectTimeHours;
  const assigned: Record<string, number> = {};
  
  // Count manager hours
  const managerDesignation = team.assigned_resources.teamManager.designation;
  assigned[managerDesignation] = (assigned[managerDesignation] || 0) + 
    team.assigned_resources.teamManager.assignedProjectHours;
  
  // Count team member hours
  team.assigned_resources.teamMembers.forEach(member => {
    assigned[member.designation] = (assigned[member.designation] || 0) + 
      member.assignedProjectHours;
  });
  
  // Create comparison data for each designation
  return Object.entries(required).map(([designation, requiredHours]) => {
    const assignedHours = assigned[designation] || 0;
    const percentFulfilled = Math.round((assignedHours / requiredHours) * 100);
    return {
      designation,
      requiredHours,
      assignedHours,
      percentFulfilled,
    };
  });
};

export default function TeamsPage() {
  const [config, setConfig] = useState<WorkplaceConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkplaceConfig() {
      try {
        const response = await fetch('/api/workplace-config');
        if (!response.ok) {
          throw new Error('Failed to fetch workplace configuration');
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Error fetching workplace config:', err);
        setError('Failed to load team data. Please try again later.');
        // For development, let's use a local import as backup
        try {
          const data = await import('../../../data/workplace_config.json');
          setConfig(data);
          setError(null);
        } catch (localErr) {
          console.error('Error loading local config:', localErr);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWorkplaceConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to board</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Teams &amp; Resources</h1>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex flex-col min-h-screen p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to board</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Teams &amp; Resources</h1>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Failed to load team data'}
        </div>
      </div>
    );
  }

  const organization = config.organization;
  const teams = organization.teams;

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to board</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Teams &amp; Resources</h1>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{organization.name}</h2>
        <p className="text-muted-foreground">Organization Resource Management</p>
      </div>
      
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="teams" className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>Teams</span>
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>People</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>Skills</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Availability</span>
          </TabsTrigger>
        </TabsList>

        {/* Teams Tab Content */}
        <TabsContent value="teams" className="space-y-6">
          {teams.map((team, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <CardTitle>{team.teamName}</CardTitle>
                <CardDescription>
                  Managed by: {team.assigned_resources.teamManager.name} ({team.assigned_resources.teamManager.designation})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Team Size</h3>
                    <p className="text-2xl font-bold">{team.assigned_resources.teamMembers.length + 1}</p>
                    <p className="text-sm text-muted-foreground">Team Members + Manager</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Project Budget</h3>
                    <p className="text-2xl font-bold">${team.projectBudget.totalBudgetUSD.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Allocated Budget</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Required Hours</h3>
                    <p className="text-2xl font-bold">{team.required_resources.totalRequiredHours.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Project Hours</p>
                  </div>
                </div>
                
                <h3 className="font-medium mb-2 mt-6">Team Composition</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(team.required_resources.requiredProjectTimeHours).map(([designation, hours]) => (
                    <div key={designation} className="flex items-center gap-1">
                      <Badge variant="outline">{designation}</Badge>
                      <span className="text-sm text-muted-foreground">{hours}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* People Tab Content */}
        <TabsContent value="people" className="space-y-6">
          {teams.map((team, teamIndex) => (
            <div key={teamIndex} className="space-y-4">
              <h3 className="text-lg font-semibold">{team.teamName}</h3>
              
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Employee ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Designation</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Skills</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Hourly Rate</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Assigned Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Team Manager */}
                    <tr className="bg-yellow-50 dark:bg-yellow-900/10">
                      <td className="px-4 py-3 text-sm font-medium">{team.assigned_resources.teamManager.name}</td>
                      <td className="px-4 py-3 text-sm">{team.assigned_resources.teamManager.employeeId}</td>
                      <td className="px-4 py-3 text-sm">{team.assigned_resources.teamManager.designation}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {team.assigned_resources.teamManager.skills.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">${team.assigned_resources.teamManager.hourlyRate}</td>
                      <td className="px-4 py-3 text-sm">{team.assigned_resources.teamManager.assignedProjectHours}</td>
                    </tr>
                    {/* Team Members */}
                    {team.assigned_resources.teamMembers.map((member, memberIndex) => (
                      <tr key={memberIndex} className={memberIndex % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'}>
                        <td className="px-4 py-3 text-sm font-medium">{member.name}</td>
                        <td className="px-4 py-3 text-sm">{member.employeeId}</td>
                        <td className="px-4 py-3 text-sm">{member.designation}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {member.skills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">${member.hourlyRate}</td>
                        <td className="px-4 py-3 text-sm">{member.assignedProjectHours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Resource Utilization Chart */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold">Resource Utilization</h3>
            {teams.map((team, teamIndex) => {
              const utilization = calculateResourceUtilization(team);
              return (
                <div key={teamIndex} className="mb-6">
                  <h4 className="font-medium">{team.teamName}</h4>
                  <div className="flex flex-col">
                    {utilization.map(({ designation, requiredHours, assignedHours, percentFulfilled }) => (
                      <div key={designation} className="flex items-center justify-between">
                        <span>{designation}</span>
                        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden ml-4">
                          <div
                            className="absolute h-full bg-green-500"
                            style={{ width: `${percentFulfilled}%` }}
                          ></div>
                        </div>
                        <span className="ml-4">{assignedHours} / {requiredHours} hrs</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Skills Tab Content */}
        <TabsContent value="skills" className="space-y-6">
          {teams.map((team, teamIndex) => (
            <Card key={teamIndex}>
              <CardHeader>
                <CardTitle>{team.teamName}: Skills Matrix</CardTitle>
                <CardDescription>Required skills by designation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(team.required_resources.skillsByDesignation).map(([designation, skills]) => (
                    <div key={designation} className="border rounded-md p-4">
                      <h3 className="font-medium mb-3">{designation}</h3>
                      <div className="space-y-2">
                        {skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="flex items-center gap-2">
                            <Badge>{skill}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Availability Tab Content */}
        <TabsContent value="availability" className="space-y-6">
          {teams.map((team, teamIndex) => (
            <Card key={teamIndex}>
              <CardHeader>
                <CardTitle>{team.teamName}: Team Availability</CardTitle>
                <CardDescription>Working hours and timezone information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="border px-4 py-2 text-left">Member</th>
                        <th className="border px-4 py-2 text-left">Timezone</th>
                        <th className="border px-4 py-2 text-left">Assigned Hours</th>
                        <th className="border px-4 py-2 text-left">Monday</th>
                        <th className="border px-4 py-2 text-left">Tuesday</th>
                        <th className="border px-4 py-2 text-left">Wednesday</th>
                        <th className="border px-4 py-2 text-left">Thursday</th>
                        <th className="border px-4 py-2 text-left">Friday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Team Manager */}
                      <tr className="bg-yellow-50 dark:bg-yellow-900/10">
                        <td className="border px-4 py-2 font-medium">{team.assigned_resources.teamManager.name}</td>
                        <td className="border px-4 py-2">{team.assigned_resources.teamManager.availability.timezone}</td>
                        <td className="border px-4 py-2 font-bold">{team.assigned_resources.teamManager.assignedProjectHours} hrs</td>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                          const hours = team.assigned_resources.teamManager.availability.workingHours[day];
                          return (
                            <td key={day} className="border px-4 py-2">
                              {hours ? `${hours[0]}:00 - ${hours[1]}:00` : 'N/A'}
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Team Members */}
                      {team.assigned_resources.teamMembers.map((member, memberIndex) => (
                        <tr key={memberIndex} className={memberIndex % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'}>
                          <td className="border px-4 py-2 font-medium">{member.name}</td>
                          <td className="border px-4 py-2">{member.availability.timezone}</td>
                          <td className="border px-4 py-2 font-bold">{member.assignedProjectHours} hrs</td>
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                            const hours = member.availability.workingHours[day];
                            return (
                              <td key={day} className="border px-4 py-2">
                                {hours ? `${hours[0]}:00 - ${hours[1]}:00` : 'N/A'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}