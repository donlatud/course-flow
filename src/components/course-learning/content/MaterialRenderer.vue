<script setup lang="ts">
import { computed } from "vue"
import VideoPlayer from "./VideoPlayer.vue"

type MaterialType = "VIDEO" | "PDF" | "IMAGE" | "TEXT"

type MaterialBlock = {
  id?: string
  type: MaterialType
  title?: string
  content?: string
  src?: string
  alt?: string
}

const props = withDefaults(
  defineProps<{
    /**
     * Single-material mode (legacy), e.g. VIDEO only.
     */
    type?: MaterialType
    /**
     * Multiple blocks per material, e.g. VIDEO+TEXT or IMAGE+TEXT.
     */
    blocks?: MaterialBlock[]
    /** Passed to VideoPlayer for VIDEO blocks (optional). */
    videoEnrollmentId?: string
    videoMaterialId?: string
    videoInitialResumeSeconds?: number | null
  }>(),
  {
    type: "VIDEO",
    blocks: () => [],
    videoEnrollmentId: undefined,
    videoMaterialId: undefined,
    videoInitialResumeSeconds: undefined,
  },
)

const resolvedBlocks = computed<MaterialBlock[]>(() => {
  if (props.blocks && props.blocks.length > 0) return props.blocks
  return [
    {
      type: props.type,
    },
  ]
})
</script>

<template>
  <article class="flex w-full flex-col gap-4">
    <template v-for="(block, index) in resolvedBlocks" :key="block.id ?? `${block.type}-${index}`">
      <VideoPlayer
        v-if="block.type === 'VIDEO'"
        :src="block.src"
        :enrollment-id="videoEnrollmentId"
        :material-id="videoMaterialId"
        :initial-resume-seconds="videoInitialResumeSeconds ?? undefined"
      />

      <section
        v-else-if="block.type === 'TEXT'"
        class="min-h-[214px] w-full rounded-[8px] bg-gray-100 px-6 py-5 text-body3 text-gray-700"
      >
        <h2
          v-if="block.title"
          class="mb-3 font-semibold text-gray-900"
        >
          {{ block.title }}
        </h2>
        <p>
          {{ block.content || "Text material content (mock)" }}
        </p>
      </section>

      <figure
        v-else-if="block.type === 'IMAGE'"
        class="flex min-h-[214px] w-full flex-col items-center justify-center rounded-[8px] bg-gray-100 px-6 py-5"
      >
        <img
          :src="block.src || '/src/assets/mock-video.png'"
          :alt="block.alt || block.title || 'Course material image preview'"
          class="max-h-[320px] w-auto rounded-md object-contain"
        />
        <figcaption
          v-if="block.title"
          class="mt-3 text-center text-caption text-gray-700"
        >
          {{ block.title }}
        </figcaption>
      </figure>

      <section
        v-else
        class="flex min-h-[214px] w-full items-center justify-center rounded-[8px] bg-gray-100 text-body3 text-gray-700"
        :aria-label="`Material preview: ${block.type}`"
      >
        {{ block.type }} preview (mock)
      </section>
    </template>
  </article>
</template>
