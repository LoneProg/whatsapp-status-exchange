<script setup lang="ts">
/**
 * components/ToastNotif.vue
 * Lightweight inline toast — success, error, or info.
 */

withDefaults(
  defineProps<{
    type?: "success" | "error" | "info";
    message: string;
  }>(),
  { type: "info" }
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
        type === 'success' && 'bg-green-50 border-green-200 text-green-800',
        type === 'error'   && 'bg-red-50   border-red-200   text-red-800',
        type === 'info'    && 'bg-blue-50  border-blue-200  text-blue-800',
      ]"
      role="alert"
    >
      <!-- Icon -->
      <svg
        v-if="type === 'success'"
        class="w-5 h-5 shrink-0 text-green-500 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <svg
        v-else-if="type === 'error'"
        class="w-5 h-5 shrink-0 text-red-500 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <svg
        v-else
        class="w-5 h-5 shrink-0 text-blue-500 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
      </svg>
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>
