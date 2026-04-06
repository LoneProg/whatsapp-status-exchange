<script setup lang="ts">
/**
 * components/BaseInput.vue
 * Accessible, validated text input with error display.
 */

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
    <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
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
        disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : '',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <!-- Hint -->
    <p v-if="hint && !error" class="text-xs text-gray-400">{{ hint }}</p>

    <!-- Error message -->
    <p v-if="error" class="text-xs text-red-500 flex items-center gap-1">
      <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clip-rule="evenodd"
        />
      </svg>
      {{ error }}
    </p>
  </div>
</template>
