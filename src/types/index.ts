export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
};

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export type Category = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  categoryId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<User, "password">;
