export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
}

export interface AuthPayload {
  user: User;
}


export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

export interface DocumentRecord {
  _id: string;
  title: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
