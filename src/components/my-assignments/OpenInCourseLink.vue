<script setup lang="ts">
import { useRouter } from "vue-router"
import GhostButton from "@/components/base/button/GhostButton.vue"

const props = defineProps<{
  courseId: string
  materialId?: string | null
}>()

const router = useRouter()

function handleOpenInCourse() {
  router.push({
    path: `/courses/${props.courseId}/learning`,
    query: props.materialId ? { materialId: props.materialId } : undefined,
  })
}
</script>

<template>
  <GhostButton class="w-auto px-3" type="button" @click="handleOpenInCourse">
    Open in Course
  </GhostButton>
</template>
