 export type Role = 'Admin' | 'ProjectManager' | 'Collaborator';
export type UserStatus = 'Active' | 'Deactivated';
export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'ToDo' | 'InProgress' | 'Completed';
export type ProjectStatus = 'Planning' | 'InProgress' | 'Completed' | 'Archived';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  joinedAt: string;
  user?: User; // Depending on how we include it
}

export interface Project {
  id: string;
  projectKey: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  visibility: string;
  colorCode?: string;
  tags?: string[];
  estimatedCompletionDate?: string;
  externalLinks?: string[];
  createdById: string;
  createdBy?: User;
  members?: ProjectMember[];
  tasks?: Task[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  status: TaskStatus;
  createdById: string;
  projectId: string;
  assignee?: User;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  taskId?: string;
  projectId?: string;
  uploadedById: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}