<script setup lang="ts">
/**
 * components/ToastNotif.vue
 * Lightweight inline toast — success, error, or info.
 */

import { CheckCircle2, AlertCircle, InfoIcon } from "lucide-vue-next";

withDefaults(
  defineProps<{
    type?: "success" | "error" | "info";
    message: string;
  }>(),
  { type: "info" },
);
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="message"
      :class="[
        'flex items-start gap-3 p-4 rounded-xl text-sm font-medium border',
        type === 'success' &&
          'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-400',
        type === 'error' &&
          'bg-red-50 dark:bg-red-900/20   border-red-200 dark:border-red-800   text-red-800 dark:text-red-400',
        type === 'info' &&
          'bg-blue-50 dark:bg-blue-900/20  border-blue-200 dark:border-blue-800  text-blue-800 dark:text-blue-400',
      ]"
      role="alert"
    >
      <!-- Icon -->
      <CheckCircle2
        v-if="type === 'success'"
        :size="20"
        class="shrink-0 mt-0.5"
      />
      <AlertCircle
        v-else-if="type === 'error'"
        :size="20"
        class="shrink-0 mt-0.5"
      />
      <InfoIcon v-else :size="20" class="shrink-0 mt-0.5" />
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>
