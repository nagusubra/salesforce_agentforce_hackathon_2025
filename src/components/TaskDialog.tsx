'use client';

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Task, TaskStatus, PriorityLevel } from "@/lib/data/types";
import { format } from "date-fns";
import { SimpleMultiSelect, MultiSelectOption } from "./ui/simple-multiselect";

interface WorkplaceData {
  organization: {
    name: string;
    teams: Array<{
      teamName: string;
      assigned_resources: {
        teamManager: {
          name: string;
          designation: string;
          skills: string[];
        };
        teamMembers: Array<{
          name: string;
          designation: string;
          skills: string[];
        }>;
      };
      required_resources: {
        skillsByDesignation: Record<string, string[]>;
      };
    }>;
  };
}

interface TaskDialogProps {
  isOpen: boolean;
  initialTask?: Task;
  initialStatus?: TaskStatus;
  onClose: () => void;
  onSave: (task: Omit<Task, "project_id" | "ticket_id" | "created" | "updated">) => void;
}

export function TaskDialog({
  isOpen,
  initialTask,
  initialStatus = "todo",
  onClose,
  onSave,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectName, setProjectName] = useState("");
  const [userId, setUserId] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [deadline, setDeadline] = useState("");
  const [membersNeeded, setMembersNeeded] = useState<string[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [titleError, setTitleError] = useState(false);

  // Workplace configuration data
  const [workplaceData, setWorkplaceData] = useState<WorkplaceData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Options for dropdowns
  const [memberOptions, setMemberOptions] = useState<MultiSelectOption[]>([]);
  const [skillOptions, setSkillOptions] = useState<MultiSelectOption[]>([]);
  const [designationOptions, setDesignationOptions] = useState<MultiSelectOption[]>([]);

  // Fetch workplace configuration
  useEffect(() => {
    async function fetchWorkplaceConfig() {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/workplace-config');
        
        if (!response.ok) {
          throw new Error('Failed to fetch workplace configuration');
        }
        
        const data = await response.json();
        setWorkplaceData(data);
        
        // Process data for dropdowns
        const memberOpts: MultiSelectOption[] = [];
        const skillOpts: MultiSelectOption[] = [];
        const designationOpts: MultiSelectOption[] = [];
        
        // Check if data structure is valid
        if (data?.organization?.teams?.length > 0) {
          data.organization.teams.forEach(team => {
            // Process team manager
            if (team?.assigned_resources?.teamManager?.name) {
              const manager = team.assigned_resources.teamManager;
              memberOpts.push({ label: manager.name, value: manager.name });
              
              // Add designation
              if (manager.designation) {
                designationOpts.push({ 
                  label: manager.designation, 
                  value: manager.designation 
                });
              }
              
              // Add skills
              if (Array.isArray(manager.skills)) {
                manager.skills.forEach(skill => {
                  if (skill) {
                    skillOpts.push({ label: skill, value: skill });
                  }
                });
              }
            }
            
            // Process team members
            if (Array.isArray(team?.assigned_resources?.teamMembers)) {
              team.assigned_resources.teamMembers.forEach(member => {
                if (member?.name) {
                  memberOpts.push({ label: member.name, value: member.name });
                  
                  if (member.designation) {
                    designationOpts.push({ 
                      label: member.designation, 
                      value: member.designation 
                    });
                  }
                  
                  if (Array.isArray(member.skills)) {
                    member.skills.forEach(skill => {
                      if (skill) {
                        skillOpts.push({ label: skill, value: skill });
                      }
                    });
                  }
                }
              });
            }
            
            // Add skills from required resources
            if (team?.required_resources?.skillsByDesignation) {
              Object.entries(team.required_resources.skillsByDesignation).forEach(([designation, skills]) => {
                if (designation) {
                  // Add designation if not already added
                  if (!designationOpts.some(d => d.value === designation)) {
                    designationOpts.push({ label: designation, value: designation });
                  }
                  
                  // Add skills
                  if (Array.isArray(skills)) {
                    skills.forEach(skill => {
                      if (skill && !skillOpts.some(s => s.value === skill)) {
                        skillOpts.push({ label: skill, value: skill });
                      }
                    });
                  }
                }
              });
            }
          });
        }
        
        // Remove duplicates by converting to Set and back
        const uniqueMembers = Array.from(
          new Set(memberOpts.map(opt => JSON.stringify(opt)))
        ).map(str => JSON.parse(str as string));
        
        const uniqueSkills = Array.from(
          new Set(skillOpts.map(opt => JSON.stringify(opt)))
        ).map(str => JSON.parse(str as string));
        
        const uniqueDesignations = Array.from(
          new Set(designationOpts.map(opt => JSON.stringify(opt)))
        ).map(str => JSON.parse(str as string));
        
        // Sort alphabetically
        setMemberOptions(uniqueMembers.sort((a, b) => a.label.localeCompare(b.label)));
        setSkillOptions(uniqueSkills.sort((a, b) => a.label.localeCompare(b.label)));
        setDesignationOptions(uniqueDesignations.sort((a, b) => a.label.localeCompare(b.label)));
        
      } catch (err) {
        console.error('Error fetching workplace config:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkplaceConfig();
  }, [isOpen]);

  // Reset form when dialog opens/changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTask?.title || "");
      setDescription(initialTask?.description || "");
      setProjectName(initialTask?.project_name || "");
      setUserId(initialTask?.user_id || "");
      setTicketId(initialTask?.ticket_id || "");
      setRequiredSkills(initialTask?.required_skills || []);
      setPriority(initialTask?.priority || "medium");
      setStatus(initialTask?.status || initialStatus);
      
      // Format date for input if available
      setDeadline(
        initialTask?.deadline
          ? format(new Date(initialTask.deadline), "yyyy-MM-dd")
          : ""
      );
      
      setMembersNeeded(initialTask?.members_needed || []);
      setMembers(initialTask?.members || []);
      setTitleError(false);
    }
  }, [isOpen, initialTask, initialStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      project_name: projectName.trim(),
      user_id: userId.trim(),
      required_skills: requiredSkills,
      priority,
      status,
      deadline: deadline ? new Date(deadline) : undefined,
      members_needed: membersNeeded,
      members: members,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title*
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError(false);
              }}
              placeholder="Task title"
              className={titleError ? "border-red-500" : ""}
              autoFocus
            />
            {titleError && (
              <p className="text-sm text-red-500">Title is required</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="projectName" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="userId" className="text-sm font-medium">
                User ID
              </label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Assigned user ID"
              />
            </div>
          </div>
          
          {initialTask && (
            <div className="space-y-2">
              <label htmlFor="ticketId" className="text-sm font-medium">
                Ticket ID
              </label>
              <Input
                id="ticketId"
                value={`#${ticketId}`}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select value={priority} onValueChange={(value) => setPriority(value as PriorityLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="deadline" className="text-sm font-medium">
              Deadline
            </label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="requiredSkills" className="text-sm font-medium">
              Required Skills
            </label>
            <SimpleMultiSelect 
              id="requiredSkills"
              options={skillOptions} 
              selected={requiredSkills}
              onChange={setRequiredSkills}
              placeholder="Select or add required skills..."
              allowCustomValues={true}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="membersNeeded" className="text-sm font-medium">
                Team Members Needed
              </label>
              <SimpleMultiSelect 
                id="membersNeeded"
                options={designationOptions} 
                selected={membersNeeded}
                onChange={setMembersNeeded}
                placeholder="Select or add designations..."
                allowCustomValues={true}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="members" className="text-sm font-medium">
                Assigned Members
              </label>
              <SimpleMultiSelect 
                id="members"
                options={memberOptions} 
                selected={members}
                onChange={setMembers}
                placeholder="Select or add members..."
                allowCustomValues={true}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}