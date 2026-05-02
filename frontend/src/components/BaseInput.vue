<script setup lang="ts">
/**
 * components/BaseInput.vue
 * Accessible, validated text input with error display.
 */

import { AlertCircle } from "lucide-vue-next";

withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    type?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
  }>(),
  {
    type: "text",
    placeholder: "",
    error: "",
    required: false,
    disabled: false,
    hint: "",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <!-- Label -->
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input -->
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="[
        'input-field',
        error ? 'input-error' : '',
        disabled ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed opacity-60' : '',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <!-- Hint -->
    <p v-if="hint && !error" class="text-xs text-gray-400 dark:text-gray-500">{{ hint }}</p>

    <!-- Error message -->
    <p v-if="error" class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
      <AlertCircle :size="14" class="shrink-0" />
      {{ error }}
    </p>
  </div>
</template>
