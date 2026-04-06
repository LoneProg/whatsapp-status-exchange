/**
 * src/api/index.ts
 * Central Axios instance — injects auth token on every request
 * and handles 401 responses globally.
 */

import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type {
  ApiResponse,
  ContactRecord,
  AdminStats,
  LoginResult,
} from "@/types";

// ── Axios instance ────────────────────────────────────────
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach Bearer token ─────────────
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 globally ───────────
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      // Redirect to login if on an admin page
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── API helpers ───────────────────────────────────────────

/**
 * Extract the error message from an Axios error response.
 */
export function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (
      (err.response?.data as ApiResponse)?.message ??
      err.message ??
      "An unexpected error occurred."
    );
  }
  return "An unexpected error occurred.";
}

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    http
      .post<ApiResponse<LoginResult>>("/auth/login", { email, password })
      .then((r: AxiosResponse<ApiResponse<LoginResult>>) => r.data),

  me: () =>
    http
      .get<ApiResponse<{ id: string; email: string }>>("/auth/me")
      .then((r) => r.data),
};

// ── Contacts (public) ─────────────────────────────────────
export const contactApi = {
  submit: (name: string, phone: string) =>
    http
      .post<ApiResponse<Partial<ContactRecord>>>("/contacts", { name, phone })
      .then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────────────
export const adminApi = {
  stats: () =>
    http
      .get<ApiResponse<AdminStats>>("/admin/stats")
      .then((r) => r.data),

  contacts: () =>
    http
      .get<ApiResponse<{ contacts: ContactRecord[]; total: number }>>(
        "/admin/contacts"
      )
      .then((r) => r.data),

  /** Triggers a browser file download of the .vcf */
  exportVcf: async (): Promise<void> => {
    const response = await http.get("/admin/export", {
      responseType: "blob",
    });

    const contentDisposition: string =
      response.headers["content-disposition"] ?? "";
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    const filename = filenameMatch
      ? filenameMatch[1]
      : "wa-exchange-contacts.vcf";

    const url = URL.createObjectURL(
      new Blob([response.data as BlobPart], { type: "text/vcard" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  deleteContact: (id: string) =>
    http
      .delete<ApiResponse>(`/admin/contacts/${id}`)
      .then((r) => r.data),
};
