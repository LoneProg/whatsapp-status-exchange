<script setup lang="ts">
/**
 * pages/HomePage.vue
 * Public landing page with the contact submission form.
 */

import { ref, reactive, computed } from "vue";
import { contactApi, extractError } from "@/api";
import BaseInput from "@/components/BaseInput.vue";
import ToastNotif from "@/components/ToastNotif.vue";
import SpinnerIcon from "@/components/SpinnerIcon.vue";

// ── Form state ─────────────────────────────────────────────
const form = reactive({ name: "", phone: "" });
const errors = reactive({ name: "", phone: "" });
const loading = ref(false);
const submitted = ref(false);
const toast = reactive({ type: "success" as "success" | "error", message: "" });

// ── Validation ─────────────────────────────────────────────
function validate(): boolean {
  errors.name = "";
  errors.phone = "";
  let valid = true;

  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = "Please enter your full name (at least 2 characters).";
    valid = false;
  }

  const phoneRaw = form.phone.trim();
  if (!phoneRaw) {
    errors.phone = "Phone number is required.";
    valid = false;
  } else if (!/^\+?[\d\s\-().]{7,20}$/.test(phoneRaw)) {
    errors.phone = "Enter a valid phone number. Include country code e.g. +234...";
    valid = false;
  }

  return valid;
}

const isFormDirty = computed(() => form.name.trim() || form.phone.trim());

// ── Submission ─────────────────────────────────────────────
async function handleSubmit() {
  toast.message = "";
  if (!validate()) return;

  loading.value = true;
  try {
    const res = await contactApi.submit(form.name.trim(), form.phone.trim());

    if (res.success) {
      submitted.value = true;
      toast.type = "success";
      toast.message = res.message ?? "Contact submitted successfully!";
      form.name = "";
      form.phone = "";
    } else {
      toast.type = "error";
      toast.message = res.message ?? "Something went wrong. Please try again.";
    }
  } catch (err) {
    toast.type = "error";
    toast.message = extractError(err);
  } finally {
    loading.value = false;
  }
}

function handleAnotherSubmission() {
  submitted.value = false;
  toast.message = "";
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-whatsapp-50 via-white to-green-50 flex flex-col">

    <!-- ── Header ─────────────────────────────────────────── -->
    <header class="w-full py-5 px-6">
      <div class="max-w-lg mx-auto flex items-center gap-3">
        <!-- WhatsApp-style icon -->
        <div class="w-10 h-10 bg-whatsapp-500 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.526 5.855L.057 23.454a.5.5 0 00.614.614l5.598-1.469A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.888 9.888 0 01-5.031-1.373l-.36-.214-3.733.979.997-3.645-.235-.374A9.861 9.861 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-base font-bold text-gray-900 leading-tight">WA Status Exchange</h1>
          <p class="text-xs text-gray-400">Grow your WhatsApp views together</p>
        </div>
      </div>
    </header>

    <!-- ── Main ───────────────────────────────────────────── -->
    <main class="flex-1 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-lg">

        <!-- Hero section -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 bg-whatsapp-100 text-whatsapp-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span class="w-2 h-2 bg-whatsapp-500 rounded-full animate-pulse"></span>
            Free · No sign-up required
          </div>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
            Boost Your<br />
            <span class="text-whatsapp-600">WhatsApp Status</span> Views
          </h2>
          <p class="text-gray-500 text-base max-w-sm mx-auto">
            Submit your contact below. We'll add you to a mutual-views group
            where everyone watches each other's status updates.
          </p>
        </div>

        <!-- How it works -->
        <div class="grid grid-cols-3 gap-3 mb-8">
          <div v-for="(step, i) in [
            { icon: '📝', label: 'Submit your contact' },
            { icon: '📲', label: 'Get added to the group' },
            { icon: '👀', label: 'Exchange status views' },
          ]" :key="i"
            class="flex flex-col items-center gap-1.5 text-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
          >
            <span class="text-2xl">{{ step.icon }}</span>
            <span class="text-xs text-gray-500 font-medium leading-tight">{{ step.label }}</span>
          </div>
        </div>

        <!-- ── Card ───────────────────────────────────────── -->
        <div class="card shadow-lg">

          <!-- SUCCESS STATE -->
          <Transition
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
          >
            <div v-if="submitted" class="text-center py-6">
              <div class="w-16 h-16 bg-whatsapp-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-whatsapp-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">You're in! 🎉</h3>
              <p class="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                Your contact has been saved. Watch out for a WhatsApp group invitation soon.
              </p>
              <button @click="handleAnotherSubmission" class="btn-secondary text-sm">
                Submit another contact
              </button>
            </div>
          </Transition>

          <!-- FORM STATE -->
          <form v-if="!submitted" @submit.prevent="handleSubmit" novalidate class="space-y-5">
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-1">Join the Exchange</h3>
              <p class="text-sm text-gray-400">Fill in your details below — takes 10 seconds.</p>
            </div>

            <!-- Toast -->
            <ToastNotif :type="toast.type" :message="toast.message" />

            <!-- Name -->
            <BaseInput
              v-model="form.name"
              label="Full Name"
              placeholder="e.g. Emeka Okafor"
              :error="errors.name"
              :disabled="loading"
              required
            />

            <!-- Phone -->
            <BaseInput
              v-model="form.phone"
              label="WhatsApp Phone Number"
              type="tel"
              placeholder="+234 801 234 5678"
              hint="Include your country code (e.g. +234 for Nigeria)"
              :error="errors.phone"
              :disabled="loading"
              required
            />

            <!-- Submit -->
            <button
              type="submit"
              class="btn-primary w-full py-3.5 text-base"
              :disabled="loading || !isFormDirty"
            >
              <SpinnerIcon v-if="loading" size="sm" color="text-white" />
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.121 1.526 5.855L.057 23.454a.5.5 0 00.614.614l5.598-1.469A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.888 9.888 0 01-5.031-1.373l-.36-.214-3.733.979.997-3.645-.235-.374A9.861 9.861 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
              </svg>
              {{ loading ? "Submitting..." : "Submit My Contact" }}
            </button>

            <p class="text-xs text-gray-400 text-center">
              🔒 Your data is stored securely and never shared externally.
            </p>
          </form>
        </div>

        <!-- Admin link -->
        <div class="text-center mt-6">
          <router-link to="/admin/login" class="text-xs text-gray-300 hover:text-gray-400 transition-colors">
            Admin access
          </router-link>
        </div>
      </div>
    </main>

    <!-- ── Footer ─────────────────────────────────────────── -->
    <footer class="py-6 text-center text-xs text-gray-300">
      © {{ new Date().getFullYear() }} WA Status Exchange. All rights reserved.
    </footer>
  </div>
</template>
