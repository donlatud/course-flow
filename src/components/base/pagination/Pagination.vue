<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next"

const props = defineProps<{
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const handlePageChange = (page: number) => {
  emit('pageChange', page)
  props.onPageChange(page)
}

const getPages = () => {
  const pages = []
  const maxVisible = 5
  
  if (props.totalPages <= maxVisible) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, props.currentPage - half)
    let end = Math.min(props.totalPages, start + maxVisible - 1)
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
}

const pages = getPages()
</script>

<template>
  <div class="flex items-center justify-center gap-2 mt-8">
    <!-- Previous Button -->
    <button
      :disabled="currentPage === 1"
      @click="handlePageChange(currentPage - 1)"
      class="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 
                 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700
                 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                 transition-colors duration-200 cursor-pointer"
    >
      <ChevronLeft class="w-4 h-4 " />
    </button>

    <!-- Page Numbers -->
    <template v-for="page in pages" :key="page">
      <button
        v-if="page !== currentPage"
        @click="handlePageChange(page)"
        class="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 
                   bg-white text-gray-700 hover:bg-gray-50 hover:text-[#2F5FAC]
                   transition-colors duration-200 cursor-pointer"
      >
        {{ page }}
      </button>
      
      <button
        v-else
        disabled
        class="flex items-center justify-center w-10 h-10 rounded-lg border border-[#2F5FAC] 
                   bg-[#2F5FAC] text-white font-medium
                    cursor-pointer"
      >
        {{ page }}
      </button>
    </template>

    <!-- Next Button -->
    <button
      :disabled="currentPage === totalPages"
      @click="handlePageChange(currentPage + 1)"
      class="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 
                 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700
                 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                 transition-colors duration-200"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>
