<template>
  <div class="flex flex-col gap-4" aria-busy="true" role="status">
    <div
      v-for="i in 2"
      :key="i"
      class="flex flex-col gap-2 rounded-lg border border-gray-200 p-4"
    >
      <div class="h-5 w-2/3 animate-pulse rounded bg-gray-200"></div>
      <div class="ml-4 flex flex-col gap-2">
        <div
          v-for="j in 3"
          :key="j"
          class="h-4 w-full animate-pulse rounded bg-gray-100"
        ></div>
      </div>
    </div>
  </div>
</template>
