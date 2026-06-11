 export type Role = 'Admin' | 'ProjectManager' | 'Collaborator';
export type UserStatus = 'Active' | 'Deactivated';
export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'ToDo' | 'InProgress' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdById: string;
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
  filename: string;
  url: string;
  taskId: string;
  uploadedById: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}