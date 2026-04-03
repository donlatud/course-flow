<template>
  <div 
    class="flex h-[214px] w-full items-center justify-center overflow-hidden rounded-[8px] bg-gray-200 md:h-[320px] lg:h-[460px]" 
    aria-busy="true" 
    role="status"
    aria-label="Loading video player"
  >
    <div class="flex flex-col items-center gap-4 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 animate-pulse"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M8 5v14l11-7z"
        />
      </svg>
      <div class="text-body3 animate-pulse">
        Loading video...
      </div>
    </div>
  </div>
</template>
