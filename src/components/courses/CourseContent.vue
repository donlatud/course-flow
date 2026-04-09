<template>
  <div class="bg-white  py-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Module Samples</h2>
    </div>

    <!-- Course Content -->
    <div v-if="modules && modules.length > 0" class="">
      <div
        v-for="module in modules"
        :key="module.moduleId"
        class=" overflow-hidden "
      >
        <!-- Module Header -->
        <div
          class="flex items-center justify-between py-4  cursor-pointer  transition-colors border-b  "
          @click="toggleModule(module.moduleId)"
        >
          <div class="flex items-center justify-around gap-6 pb-2">
              <span class="text-body1  text-gray-700">{{ String(module.orderIndex).padStart(2, '0') }}</span>
            <div>
              <h3 class="text-body1 max-w-[246px]">{{ module.title }}</h3>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <img
            src="@/assets/icon-arrow-down.svg"
              class="w-[10px] h-[5px] text-gray-400 transform transition-transform duration-200"
              :class="{ 'rotate-180': expandedModules.includes(module.moduleId) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </img>
          </div>
        </div>

        <!-- Module Materials -->
        <div
          v-show="expandedModules.includes(module.moduleId)"
          class="border-t border-b border-gray-400 pt-4 pb-4"
        >
          <div
            v-for="material in module.materials"
            :key="material.id"
            class="flex items-center gap-3 px-10 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="selectMaterial(material)"
          >
            <div class="w-2 h-2 bg-gray-700 rounded-full"></div>
            <span class="text-body2 text-gray-700">{{ material.title }}</span>
          </div>
        </div>
      </div>
    </div>
    

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-600">No course content available</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ModuleWithMaterials, Material } from '@/types/course'

interface Props {
  modules: ModuleWithMaterials[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  materialSelected: [material: Material]
}>()

const expandedModules = ref<string[]>([]) // Expand all modules by default

const toggleModule = (moduleId: string) => {
  const index = expandedModules.value.indexOf(moduleId)
  if (index > -1) {
    expandedModules.value.splice(index, 1)
  } else {
    expandedModules.value.push(moduleId)
  }
}

const selectMaterial = (material: Material) => {
  emit('materialSelected', material)
}
</script>
