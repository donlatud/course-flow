<script setup lang="ts">
import { ref, watch } from "vue"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { CourseModule } from "@/types/course-learning/sidebar-module"
import SubLessonItem from "./SubLessonItem.vue"

const props = withDefaults(
  defineProps<{
    modules: CourseModule[]
    activeLessonId: string
    /** Fallback open section when `activeLessonId` matches no lesson. */
    defaultOpenModuleId?: string
  }>(),
  { defaultOpenModuleId: undefined },
)

const emit = defineEmits<{
  "update:activeLessonId": [id: string]
}>()

const openModuleId = ref<string | undefined>(undefined)

function moduleIdForActiveLesson(): string | undefined {
  const { activeLessonId, modules, defaultOpenModuleId } = props
  if (!modules.length)
    return undefined
  if (activeLessonId) {
    for (const m of modules) {
      if (m.lessons.some((l) => l.id === activeLessonId))
        return m.id
    }
  }
  if (defaultOpenModuleId)
    return defaultOpenModuleId
  return modules[0]?.id
}

watch(
  () => [props.activeLessonId, props.modules, props.defaultOpenModuleId] as const,
  () => {
    openModuleId.value = moduleIdForActiveLesson()
  },
  { immediate: true, deep: true },
)

function onSelectLesson(id: string) {
  emit("update:activeLessonId", id)
}
</script>

<template>
  <Accordion
    v-model="openModuleId"
    type="single"
    class="w-full"
    :collapsible="true"
  >
    <AccordionItem
      v-for="mod in modules"
      :key="mod.id"
      :value="mod.id"
      class="border-gray-400 border-b bg-white"
    >
      <AccordionTrigger
        class="min-h-14 gap-6 px-0 py-4 pr-1 hover:no-underline focus-visible:ring-offset-0 [&[data-state=open]>svg]:rotate-180"
      >
        <span class="w-7 shrink-0 text-body2 text-gray-700 tabular-nums">
          {{ mod.indexLabel }}
        </span>
        <span class="min-w-0 flex-1 text-left text-body2 text-black">
          {{ mod.title }}
        </span>
      </AccordionTrigger>
      <AccordionContent class="pb-3">
        <ul class="flex flex-col gap-1">
          <SubLessonItem
            v-for="lesson in mod.lessons"
            :key="lesson.id"
            :lesson="lesson"
            :is-active="activeLessonId === lesson.id"
            @select="onSelectLesson"
          />
        </ul>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
