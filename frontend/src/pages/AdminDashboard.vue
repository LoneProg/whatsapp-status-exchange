<script setup lang="ts">
/**
 * pages/AdminDashboard.vue
 * Admin panel — stats, contact list, VCF export, contact deletion.
 */

import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore, useAdminStore } from "@/stores/auth.store";
import ToastNotif from "@/components/ToastNotif.vue";
import SpinnerIcon from "@/components/SpinnerIcon.vue";
import type { ContactRecord } from "@/types";

const router    = useRouter();
const auth      = useAuthStore();
const adminData = useAdminStore();

// ── Search / filter ─────────────────────────────────────────
const searchQuery  = ref("");
const sortOrder    = ref<"newest" | "oldest">("newest");

const filteredContacts = computed(() => {
  let list = [...adminData.contacts];

  // Filter by search
  const q = searchQuery.value.toLowerCase().trim();
  if (q) {
    list = list.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }

  // Sort
  list.sort((a, b) => {
    const diff =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortOrder.value === "newest" ? -diff : diff;
  });

  return list;
});

// ── Delete ─────────────────────────────────────────────────
const deletingId      = ref<string | null>(null);
const confirmDeleteId = ref<string | null>(null);
const deleteToast     = ref({ type: "success" as "success" | "error", message: "" });

function promptDelete(contact: ContactRecord) {
  confirmDeleteId.value = contact.id;
}

async function confirmDelete() {
  if (!confirmDeleteId.value) return;
  deletingId.value = confirmDeleteId.value;
  confirmDeleteId.value = null;

  try {
    await adminData.deleteContact(deletingId.value);
    deleteToast.value = { type: "success", message: "Contact deleted successfully." };
  } catch {
    deleteToast.value = { type: "error", message: adminData.error ?? "Delete failed." };
  } finally {
    deletingId.value = null;
    setTimeout(() => { deleteToast.value.message = ""; }, 4000);
  }
}

// ── Export ─────────────────────────────────────────────────
const exportToast = ref({ type: "success" as "success" | "error", message: "" });

async function handleExport() {
  exportToast.value.message = "";
  try {
    await adminData.exportVcf();
    exportToast.value = { type: "success", message: "VCF file downloaded successfully!" };
  } catch {
    exportToast.value = { type: "error", message: adminData.error ?? "Export failed." };
  } finally {
    setTimeout(() => { exportToast.value.message = ""; }, 4000);
  }
}

// ── Logout ─────────────────────────────────────────────────
function logout() {
  auth.logout();
  router.push("/admin/login");
}

// ── Helpers ─────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

// ── Lifecycle ───────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([adminData.fetchStats(), adminData.fetchContacts()]);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ── Top navigation bar ─────────────────────────────── -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-whatsapp-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.526 5.855L.057 23.454a.5.5 0 00.614.614l5.598-1.469A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.888 9.888 0 01-5.031-1.373l-.36-.214-3.733.979.997-3.645-.235-.374A9.861 9.861 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium">Admin Dashboard</p>
            <p class="text-sm font-bold text-gray-800 -mt-0.5">WA Exchange</p>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <span class="hidden sm:block text-sm text-gray-500">
            {{ auth.admin?.email }}
          </span>
          <button @click="logout" class="btn-secondary text-sm py-2 px-4">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- ── Main content ───────────────────────────────────── -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <!-- Page header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Contact Management</h1>
          <p class="text-sm text-gray-400 mt-0.5">View, manage, and export all submitted contacts.</p>
        </div>

        <!-- Export button -->
        <button
          @click="handleExport"
          :disabled="adminData.exportLoading || adminData.contacts.length === 0"
          class="btn-primary shrink-0"
        >
          <SpinnerIcon v-if="adminData.exportLoading" size="sm" color="text-white" />
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ adminData.exportLoading ? "Exporting..." : "Export .vcf File" }}
        </button>
      </div>

      <!-- Export toast -->
      <ToastNotif :type="exportToast.type" :message="exportToast.message" />

      <!-- ── Stats cards ─────────────────────────────────── -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Total contacts -->
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-whatsapp-100 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-whatsapp-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Contacts</p>
            <div v-if="adminData.loadingStats" class="mt-1">
              <SpinnerIcon size="sm" />
            </div>
            <p v-else class="text-3xl font-extrabold text-gray-900">
              {{ adminData.stats?.totalContacts ?? 0 }}
            </p>
          </div>
        </div>

        <!-- Filtered count -->
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Showing</p>
            <p class="text-3xl font-extrabold text-gray-900">{{ filteredContacts.length }}</p>
          </div>
        </div>

        <!-- VCF export info -->
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">VCF Format</p>
            <p class="text-sm font-bold text-gray-900 mt-0.5">vCard 3.0</p>
            <p class="text-xs text-gray-400">WhatsApp compatible</p>
          </div>
        </div>
      </div>

      <!-- Delete toast -->
      <ToastNotif :type="deleteToast.type" :message="deleteToast.message" />

      <!-- ── Contact table ───────────────────────────────── -->
      <div class="card p-0 overflow-hidden">
        <!-- Table toolbar -->
        <div class="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <!-- Search -->
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search by name or phone..."
              class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-whatsapp-500 focus:border-transparent"
            />
          </div>

          <!-- Sort -->
          <select
            v-model="sortOrder"
            class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-whatsapp-500 bg-white text-gray-700"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <!-- Loading state -->
        <div v-if="adminData.loadingContacts" class="flex items-center justify-center py-20 gap-3 text-gray-400">
          <SpinnerIcon size="lg" color="text-whatsapp-500" />
          <span class="text-sm">Loading contacts...</span>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="filteredContacts.length === 0"
          class="text-center py-20 px-6"
        >
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p class="font-semibold text-gray-600">
            {{ searchQuery ? "No contacts match your search." : "No contacts yet." }}
          </p>
          <p class="text-sm text-gray-400 mt-1">
            {{ searchQuery ? "Try a different search term." : "Share the submission link to start collecting contacts." }}
          </p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">#</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</th>
                <th class="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Submitted</th>
                <th class="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="(contact, idx) in filteredContacts"
                :key="contact.id"
                class="hover:bg-gray-50 transition-colors duration-100"
                :class="{ 'opacity-50': deletingId === contact.id }"
              >
                <!-- Row number -->
                <td class="px-5 py-3.5 text-gray-400 font-mono text-xs">
                  {{ idx + 1 }}
                </td>

                <!-- Name -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                      :style="`background-color: hsl(${(contact.name.charCodeAt(0) * 37) % 360}, 65%, 55%)`"
                    >
                      {{ contact.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-medium text-gray-800">{{ contact.name }}</span>
                  </div>
                </td>

                <!-- Phone -->
                <td class="px-5 py-3.5">
                  <span class="font-mono text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700">
                    {{ contact.phone }}
                  </span>
                </td>

                <!-- Date -->
                <td class="px-5 py-3.5 text-gray-400 text-xs hidden sm:table-cell whitespace-nowrap">
                  {{ formatDate(contact.createdAt) }}
                </td>

                <!-- Delete -->
                <td class="px-5 py-3.5 text-right">
                  <button
                    @click="promptDelete(contact)"
                    :disabled="deletingId === contact.id"
                    class="btn-danger"
                  >
                    <SpinnerIcon v-if="deletingId === contact.id" size="sm" color="text-red-500" />
                    <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table footer -->
        <div v-if="filteredContacts.length > 0" class="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
          <span>{{ filteredContacts.length }} contact{{ filteredContacts.length !== 1 ? "s" : "" }} shown</span>
          <span>Click "Export .vcf File" to download all contacts</span>
        </div>
      </div>
    </main>

    <!-- ── Delete Confirmation Modal ─────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div
        v-if="confirmDeleteId"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="confirmDeleteId = null"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
          <!-- Icon -->
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 text-center mb-2">Delete Contact?</h3>
          <p class="text-sm text-gray-500 text-center mb-6">
            This action cannot be undone. The contact will be permanently removed from the database.
          </p>
          <div class="flex gap-3">
            <button @click="confirmDeleteId = null" class="btn-secondary flex-1">
              Cancel
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>
