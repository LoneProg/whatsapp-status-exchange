<script setup lang="ts">
/**
 * pages/AdminLogin.vue
 * Admin login — validates credentials and redirects to dashboard.
 */

import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import BaseInput from "@/components/BaseInput.vue";
import ToastNotif from "@/components/ToastNotif.vue";
import SpinnerIcon from "@/components/SpinnerIcon.vue";

const router = useRouter();
const route  = useRoute();
const auth   = useAuthStore();

const form   = reactive({ email: "", password: "" });
const errors = reactive({ email: "", password: "" });
const showPassword = ref(false);

function validate(): boolean {
  errors.email = "";
  errors.password = "";
  let ok = true;

  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Please enter a valid email address.";
    ok = false;
  }
  if (!form.password || form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
    ok = false;
  }
  return ok;
}

async function handleLogin() {
  auth.error = null;
  if (!validate()) return;

  const success = await auth.login(form.email.trim(), form.password);

  if (success) {
    const redirect = (route.query.redirect as string) || "/admin";
    router.push(redirect);
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center px-4">

    <!-- Logo -->
    <div class="mb-8 flex flex-col items-center gap-3">
      <div class="w-14 h-14 bg-whatsapp-500 rounded-2xl flex items-center justify-center shadow-xl">
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.526 5.855L.057 23.454a.5.5 0 00.614.614l5.598-1.469A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.888 9.888 0 01-5.031-1.373l-.36-.214-3.733.979.997-3.645-.235-.374A9.861 9.861 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
        </svg>
      </div>
      <div class="text-center">
        <p class="text-gray-400 text-sm font-medium tracking-widest uppercase">Admin Panel</p>
        <h1 class="text-white text-2xl font-bold mt-0.5">WA Exchange</h1>
      </div>
    </div>

    <!-- Card -->
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Sign in</h2>
      <p class="text-sm text-gray-400 mb-6">Access your admin dashboard</p>

      <!-- Error toast -->
      <ToastNotif v-if="auth.error" type="error" :message="auth.error" class="mb-5" />

      <form @submit.prevent="handleLogin" novalidate class="space-y-4">
        <!-- Email -->
        <BaseInput
          v-model="form.email"
          label="Email Address"
          type="email"
          placeholder="admin@example.com"
          :error="errors.email"
          :disabled="auth.loading"
          required
        />

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">
            Password <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              :disabled="auth.loading"
              :class="[
                'input-field pr-12',
                errors.password ? 'input-error' : '',
              ]"
              required
            />
            <!-- Toggle visibility -->
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <!-- Eye icon -->
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <!-- Eye-slash icon -->
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="text-xs text-red-500">{{ errors.password }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn-primary w-full py-3 mt-2"
          :disabled="auth.loading"
        >
          <SpinnerIcon v-if="auth.loading" size="sm" color="text-white" />
          {{ auth.loading ? "Signing in..." : "Sign In" }}
        </button>
      </form>
    </div>

    <!-- Back to site -->
    <router-link
      to="/"
      class="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to main site
    </router-link>
  </div>
</template>
