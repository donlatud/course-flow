<template>
  <section 
    class="flex flex-col gap-2" 
    aria-busy="true" 
    role="status"
    aria-label="Loading progress"
  >
    <div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
    <div class="h-2 w-full animate-pulse rounded-full bg-gray-200"></div>
  </section>
</template>
