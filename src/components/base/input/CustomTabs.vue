<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface TabOption {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  tabs: TabOption[]
  class?: string
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <Tabs
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    class="w-full"
  >
    <TabsList
      :class="cn(
        'h-auto w-full justify-start rounded-none border-b border-gray-200 bg-transparent p-0',
        props.class
      )"
    >
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="cn(
          // ✅ สไตล์พื้นฐาน: ตัวหนังสือสีเทา จางๆ
          'relative h-12 rounded-none border-b-2 border-b-transparent bg-transparent px-6 py-3 text-base font-medium text-slate-400 transition-all',
          'hover:text-slate-600',
          'data-[state=active]:border-b-black data-[state=active]:text-black data-[state=active]:shadow-none',
          // ปรับแต่งเส้นขีดด้านล่างให้ชัดเจนตามรูป
        )"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>