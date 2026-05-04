/**
 * src/stores/auth.store.ts
 * Pinia store managing admin authentication state.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi, adminApi, extractError } from "@/api";
import type { AdminInfo } from "@/types";

export const useAuthStore = defineStore("auth", () => {
  // ── State ───────────────────────────────────────────────
  const token = ref<string | null>(localStorage.getItem("admin_token"));
  const admin = ref<AdminInfo | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ── Getters ─────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value);

  // ── Actions ─────────────────────────────────────────────

  /** Login and persist token to localStorage. */
  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const res = await authApi.login(email, password);

      if (res.success && res.data) {
        token.value = res.data.token;
        admin.value = res.data.admin;
        localStorage.setItem("admin_token", res.data.token);
        return true;
      }

      error.value = res.message ?? "Login failed.";
      return false;
    } catch (err) {
      error.value = extractError(err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  /** Verify persisted token is still valid. */
  async function verifySession(): Promise<boolean> {
    if (!token.value) return false;

    try {
      const res = await authApi.me();
      if (res.success && res.data) {
        admin.value = res.data;
        return true;
      }
      logout();
      return false;
    } catch {
      logout();
      return false;
    }
  }

  /** Clear session. */
  function logout(): void {
    token.value = null;
    admin.value = null;
    localStorage.removeItem("admin_token");
  }

  return {
    token,
    admin,
    loading,
    error,
    isAuthenticated,
    login,
    verifySession,
    logout,
  };
});

// ── Admin dashboard data store ───────────────────────────
import type { ContactRecord, AdminStats } from "@/types";

export const useAdminStore = defineStore("adminData", () => {
  const stats = ref<AdminStats | null>(null);
  const contacts = ref<ContactRecord[]>([]);
  const loadingStats = ref(false);
  const loadingContacts = ref(false);
  const exportLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchStats(): Promise<void> {
    loadingStats.value = true;
    error.value = null;
    try {
      const res = await adminApi.stats();
      if (res.success && res.data) stats.value = res.data;
    } catch (err) {
      error.value = extractError(err);
    } finally {
      loadingStats.value = false;
    }
  }   

  async function fetchContacts(): Promise<void> {
    loadingContacts.value = true;
    error.value = null;
    try {
      const res = await adminApi.contacts();
      if (res.success && res.data) contacts.value = res.data.contacts;
    } catch (err) {
      error.value = extractError(err);
    } finally {
      loadingContacts.value = false;
    }
  }

  async function exportVcf(): Promise<void> {
    exportLoading.value = true;
    try {
      await adminApi.exportVcf();
    } catch (err) {
      error.value = extractError(err);
    } finally {
      exportLoading.value = false;
    }
  }

  async function deleteContact(id: string): Promise<void> {
    try {
      await adminApi.deleteContact(id);
      contacts.value = contacts.value.filter((c) => c.id !== id);
      if (stats.value) stats.value.totalContacts -= 1;
    } catch (err) {
      error.value = extractError(err);
      throw err;
    }
  }

  return {
    stats,
    contacts,
    loadingStats,
    loadingContacts,
    exportLoading,
    error,
    fetchStats,
    fetchContacts,
    exportVcf,
    deleteContact,
  };
});
