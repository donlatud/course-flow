```vue
<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabOption {
  value: string;
  label: string;
}

const props = defineProps<{
  modelValue: string;
  tabs: TabOption[];
  class?: string;
}>();

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <Tabs
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    class="w-full flex justify-center"
  >
    <TabsList
      :class="
        cn(
          'h-auto w-fit mx-auto justify-center rounded-none border-b border-gray-200 bg-transparent p-0 gap-4 lg:gap-8',
          props.class,
        )
      "
    >
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="
          cn(
            'relative h-12 rounded-none border-b-2 border-b-transparent bg-transparent  py-3 text-body2! text-gray-600 transition-all cursor-pointer',
            'data-[state=active]:border-b-black data-[state=active]:text-black data-[state=active]:shadow-none',
          )
        "
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
