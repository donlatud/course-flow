<script setup lang="ts">

const colorGroups = [
  {
    title: 'Blue',
    colors: [
      { name: 'Blue 100', className: 'bg-blue-100' },
      { name: 'Blue 200', className: 'bg-blue-200' },
      { name: 'Blue 300', className: 'bg-blue-300' },
      { name: 'Blue 400', className: 'bg-blue-400' },
      { name: 'Blue 500', className: 'bg-blue-500' },
      { name: 'Blue 600', className: 'bg-blue-600' },
      { name: 'Blue 700', className: 'bg-blue-700' },
      { name: 'Blue 800', className: 'bg-blue-800' },
      { name: 'Blue 900', className: 'bg-blue-900' },
    ],
  },
  {
    title: 'Gray',
    colors: [
      { name: 'Gray 100', className: 'bg-gray-100' },
      { name: 'Gray 200', className: 'bg-gray-200' },
      { name: 'Gray 300', className: 'bg-gray-300' },
      { name: 'Gray 400', className: 'bg-gray-400' },
      { name: 'Gray 500', className: 'bg-gray-500' },
      { name: 'Gray 600', className: 'bg-gray-600' },
      { name: 'Gray 700', className: 'bg-gray-700' },
      { name: 'Gray 800', className: 'bg-gray-800' },
      { name: 'Gray 900', className: 'bg-gray-900' },
    ],
  },
  {
    title: 'Orange',
    colors: [
      { name: 'Orange 100', className: 'bg-orange-100' },
      { name: 'Orange 500', className: 'bg-orange-500' },
    ],
  },
  {
    title: 'Utility',
    colors: [
      { name: 'Black', className: 'bg-black' },
      {
        name: 'White',
        className: 'bg-white border border-gray-200',
      },
      { name: 'Green', className: 'bg-green' },
      { name: 'linear1', className: 'bg-gradient-linear-1' },
      { name: 'linear2', className: 'bg-gradient-linear-2' },
    ],
  },
]
</script>

<template>
  <main class="min-h-screen bg-[#f3f3f3] px-8 py-10 md:px-12 lg:px-16">
    <div class="mx-auto max-w-[1200px] space-y-10">
      <!-- Typography -->
      <section>
        <p class="mb-2 text-sm text-gray-500">typography</p>

        <div
          class="w-full max-w-[490px] rounded-none border-2 border-blue-400 bg-white px-16 py-14"
        >
          <div class="space-y-8 text-gray-900">
            <h1 class="text-headline1">
              Headline1
            </h1>

            <h2 class="text-headline2">
              Headline2
            </h2>

            <h3 class="text-headline3">Headline3</h3>

            <div class="space-y-7">
              <p class="text-body1">Body1</p>
              <p class="text-body2">Body2</p>
              <p class="text-body3">Body3</p>
              <p class="text-body4">Body4</p>
            </div>
          </div>
        </div>
      </section>
      <!-- Colors -->
      <section>
        <p class="mb-2 text-sm text-gray-500">colors</p>

        <div class="rounded-none bg-white px-10 py-12">
          <div class="space-y-12">
            <div
              v-for="group in colorGroups"
              :key="group.title"
              class="space-y-4"
            >
              <h3 class="text-[18px] font-semibold text-gray-900">
                {{ group.title }}
              </h3>

              <div class="flex flex-wrap gap-x-3 gap-y-6">
                <div
                  v-for="color in group.colors"
                  :key="color.name"
                  class="w-[104px] text-center"
                >
                  <div
                    :class="color.className"
                    class="mx-auto h-10 w-[104px] rounded-full"
                  />
                  <p class="mt-2 text-[14px] font-medium text-gray-900">
                    {{ color.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
