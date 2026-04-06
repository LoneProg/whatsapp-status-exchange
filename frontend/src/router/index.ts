/**
 * src/router/index.ts
 * Vue Router — public routes + admin-guarded routes.
 */

import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/pages/HomePage.vue"),
    meta: { title: "Join WA Status Exchange" },
  },
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/pages/AdminLogin.vue"),
    meta: { title: "Admin Login", guestOnly: true },
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: () => import("@/pages/AdminDashboard.vue"),
    meta: { title: "Admin Dashboard", requiresAuth: true },
  },
  // Catch-all — redirect to home
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// ── Navigation Guards ─────────────────────────────────────
router.beforeEach(async (to, _from, next) => {
  // Update document title
  document.title = `${to.meta.title ?? "WA Exchange"} | WA Status Exchange`;

  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    // Verify session (handles page refresh with stale token)
    const valid = authStore.isAuthenticated
      ? await authStore.verifySession()
      : false;

    if (!valid) {
      return next({ name: "AdminLogin", query: { redirect: to.fullPath } });
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: "AdminDashboard" });
  }

  next();
});

export default router;
