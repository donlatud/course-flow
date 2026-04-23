<template>
  <section 
    class="flex flex-col gap-4 rounded-[8px] bg-blue-100 p-4 md:gap-5 md:p-5 lg:mt-[47px] lg:h-[314px] lg:gap-[25px] lg:p-6" 
    aria-busy="true" 
    role="status"
    aria-label="Loading assignment"
  >
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div class="h-6 w-32 animate-pulse rounded bg-gray-300"></div>
      <div class="h-6 w-20 animate-pulse rounded-full bg-gray-300"></div>
    </header>

    <!-- Prompt -->
    <div class="flex flex-col gap-2">
      <div class="h-5 w-full animate-pulse rounded bg-gray-300"></div>
      <div class="h-5 w-3/4 animate-pulse rounded bg-gray-300"></div>
    </div>

    <!-- Textarea placeholder -->
    <div class="min-h-[96px] w-full animate-pulse rounded-[8px] bg-white/50"></div>

    <!-- Button placeholder -->
    <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
      <div class="h-15 w-full animate-pulse rounded-lg bg-gray-300 lg:w-[203px]"></div>
      <div class="h-4 w-48 animate-pulse rounded bg-gray-300"></div>
    </div>
  </section>
</template>
