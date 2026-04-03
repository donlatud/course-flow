<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-vue-next";

const props = defineProps<{
  title: string;
  subtitle: string;
  uploadtext: string;
  class?: HTMLAttributes["class"];
  /** MIME types / extensions for the hidden file input */
  accept?: string;
  disabled?: boolean;
  modelValue?: File | null;
  /** Existing uploaded URL — shown when modelValue is null (for edit forms) */
  existingUrl?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", file: File | null): void;
  (e: "change", file: File | null): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);

const isImage = computed(
  () => props.modelValue?.type.startsWith("image/") ?? false,
);
const isVideo = computed(
  () => props.modelValue?.type.startsWith("video/") ?? false,
);

const existingIsVideo = computed(() => {
  const url = props.existingUrl ?? "";
  return /\.(mp4|mov|avi|webm)(\?|$)/i.test(url);
});

watch(
  () => props.modelValue,
  (file) => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = null;
    }
    if (file) {
      previewUrl.value = URL.createObjectURL(file);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});

function openPicker() {
  if (props.disabled) return;
  inputRef.value?.click();
}

function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  emit("update:modelValue", file);
  emit("change", file);
  input.value = "";
}

function clearFile(ev: Event) {
  ev.stopPropagation();
  if (props.disabled) return;
  emit("update:modelValue", null);
  emit("change", null);
}

const previewShellClass = cn(
  "relative aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border-2 border-gray-200 bg-[#F5F7FB]",
);
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex flex-col gap-1">
      <span class="text-body3 font-medium text-gray-800">{{ title }}</span>
      <p class="text-body4 text-gray-500">{{ subtitle }}</p>
    </div>

    <!-- Preview: image -->
    <div
      v-if="modelValue && previewUrl && isImage"
      :class="cn(previewShellClass, props.class)"
    >
      <img
        :src="previewUrl"
        alt=""
        class="h-full w-full cursor-pointer object-cover"
        @click="openPicker"
      >
      <button
        type="button"
        class="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white disabled:opacity-50"
        :disabled="disabled"
        aria-label="Remove file"
        @click="clearFile"
      >
        <X class="h-4 w-4" :stroke-width="2" />
      </button>
    </div>

    <!-- Preview: video -->
    <div
      v-else-if="modelValue && previewUrl && isVideo"
      :class="cn(previewShellClass, props.class)"
    >
      <video
        :src="previewUrl"
        class="h-full w-full object-cover"
        controls
        playsinline
        preload="metadata"
      />
      <button
        type="button"
        class="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white disabled:opacity-50"
        :disabled="disabled"
        aria-label="Remove file"
        @click="clearFile"
      >
        <X class="h-4 w-4" :stroke-width="2" />
      </button>
    </div>

    <!-- Other file types -->
    <div
      v-else-if="modelValue && previewUrl"
      :class="cn(previewShellClass, 'flex flex-col items-center justify-center gap-2 p-4', props.class)"
    >
      <p class="break-all text-center text-body3 text-gray-700">
        {{ modelValue.name }}
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          class="text-body3 font-medium text-blue-500 hover:text-blue-600"
          :disabled="disabled"
          @click="openPicker"
        >
          {{ uploadtext }}
        </button>
        <button
          type="button"
          class="text-body3 font-medium text-gray-600 hover:text-gray-800"
          :disabled="disabled"
          @click="clearFile"
        >
          Remove
        </button>
      </div>
    </div>

    <!-- Existing image URL (edit mode, no new file selected) -->
    <div
      v-else-if="!modelValue && existingUrl && !existingIsVideo"
      :class="cn(previewShellClass, props.class)"
    >
      <img
        :src="existingUrl"
        alt=""
        class="h-full w-full cursor-pointer object-cover"
        @click="openPicker"
      >
      <button
        type="button"
        class="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white disabled:opacity-50"
        :disabled="disabled"
        aria-label="Change file"
        @click="openPicker"
      >
        <Plus class="h-4 w-4" :stroke-width="2" />
      </button>
    </div>

    <!-- Existing video URL (edit mode, no new file selected) -->
    <div
      v-else-if="!modelValue && existingUrl && existingIsVideo"
      :class="cn(previewShellClass, props.class)"
    >
      <video
        :src="existingUrl"
        class="h-full w-full object-cover"
        controls
        playsinline
        preload="metadata"
      />
      <button
        type="button"
        class="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white disabled:opacity-50"
        :disabled="disabled"
        aria-label="Change file"
        @click="openPicker"
      >
        <Plus class="h-4 w-4" :stroke-width="2" />
      </button>
    </div>

    <!-- Empty dropzone -->
    <button
      v-else
      type="button"
      :class="
        cn(
          'group relative flex aspect-square w-full max-w-[320px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-[#F5F7FB] transition-colors hover:border-blue-300 hover:bg-[#EEF2FA] disabled:cursor-not-allowed disabled:opacity-50',
          props.class,
        )
      "
      :disabled="disabled"
      @click="openPicker"
    >
      <Plus
        class="h-6 w-6 text-blue-400 transition-colors group-hover:text-blue-600"
        :stroke-width="2"
        aria-hidden="true"
      />
      <span class="text-body3 font-medium text-blue-400 group-hover:text-blue-600">
        {{ uploadtext }}
      </span>
    </button>

    <input
      ref="inputRef"
      type="file"
      class="sr-only"
      tabindex="-1"
      :accept="accept ?? 'image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png'"
      :disabled="disabled"
      @change="onFileChange"
    >
  </div>
</template>
