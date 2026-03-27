<script setup lang="ts">
import { RouterView } from 'vue-router'
import PrimaryButton from '@/components/base/button/PrimaryButton.vue'
import SecondaryButton from '@/components/base/button/SecondaryButton.vue'
import { appToast, Toaster } from '@/components/base/toast'

function showSuccessToast() {
  appToast.success('Success', 'Changes were applied successfully.')
}

function showErrorToast() {
  appToast.error('Something went wrong', 'Please try again.')
}
</script>

<template>

 <!-- Toast examples -->
 <main class="min-h-screen bg-[#f3f3f3] px-8 py-10 md:px-12 lg:px-16">
    <div class="mx-auto max-w-[1200px] space-y-10">
      <section>
          <div class="flex flex-wrap gap-4">
            <PrimaryButton type="button" @click="showSuccessToast">
              Success toast
            </PrimaryButton>
            <SecondaryButton type="button" @click="showErrorToast">
              Error toast
            </SecondaryButton>
          </div>
      </section>
    </div>
    <Toaster position="bottom-right" :offset="{ bottom: 16, right: 16 }" />
  </main>

  <RouterView />
  
</template>