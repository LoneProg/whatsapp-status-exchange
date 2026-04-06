/**
 * src/types/index.ts
 * Shared TypeScript interfaces for the frontend.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ContactRecord {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface AdminStats {
  totalContacts: number;
}

export interface AdminInfo {
  id: string;
  email: string;
}

export interface LoginResult {
  token: string;
  admin: AdminInfo;
}
