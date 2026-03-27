<script setup lang="ts">
/**
 * Confirm Modal (Base Component)
 *
 * วิธีใช้:
 * 1) สร้าง state สำหรับเปิด/ปิด modal ที่ parent component
 * 2) ผูกด้วย `v-model:open`
 * 3) ส่ง props ตามที่ต้องการ และดัก events เพื่อจัดการ action
 *
 * Props:
 * - `open` (ผ่าน v-model): boolean สถานะแสดง/ซ่อน modal
 * - `title?`: หัวข้อ modal
 * - `message?`: ข้อความอธิบาย
 * - `leftText?`: ข้อความปุ่มซ้าย
 * - `rightText?`: ข้อความปุ่มขวา
 * - `type?`: 'primary' | 'secondary'
 *   - 'primary' => ปุ่มซ้ายเป็น Primary, ขวาเป็น Secondary
 *   - 'secondary' => ปุ่มซ้ายเป็น Secondary, ขวาเป็น Primary
 * - `class?`: class เพิ่มเติมสำหรับกล่อง modal (`section`)
 *
 * Events:
 * - `@close`: กดปิดที่ปุ่ม X
 * - `@left-click`: กดปุ่มซ้าย
 * - `@right-click`: กดปุ่มขวา
 *
 * ตัวอย่าง:
 * ตัวอย่างการเรียกใช้งานใน template:
 * `<ConfirmDeleteLessonModal
 *    v-model:open="isOpen"
 *    title="Cancel request"
 *    message="Are you sure you want to cancel this request?"
 *    left-text="Keep request"
 *    right-text="Cancel request"
 *    type="secondary"
 *    class="max-w-[560px]"
 *    @left-click="isOpen = false"
 *    @right-click="onConfirmDelete"
 *  />`
 */
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import PrimaryButton from '@/components/base/button/PrimaryButton.vue'
import SecondaryButton from '@/components/base/button/SecondaryButton.vue'
import { cn } from '@/lib/utils'

const open = defineModel<boolean>('open', { required: true })

interface Props {
  title?: string
  message?: string
  leftText?: string
  rightText?: string
  type?: 'primary' | 'secondary'
  class?: HTMLAttributes['class']

}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmation',
  message: 'Are you sure you want to delete this lesson?',
  leftText: 'Yes, I want to delete this lesson',
  rightText: 'No, keep it',
  type: 'primary',

})

const emit = defineEmits<{
  close: []
  leftClick: []
  rightClick: []
}>()

const leftIsPrimary = computed(() => props.type === 'primary')



const onClose = () => {
  open.value = false
  emit('close')
}

const onLeftClick = () => {
  emit('leftClick')
}

const onRightClick = () => {
  emit('rightClick')
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-500 grid place-items-center bg-black/20 px-4"
    aria-modal="true"
    role="dialog"
  >
    <section
      :class="
        cn(
          'w-full max-w-[528px] overflow-hidden rounded-[24px] bg-white shadow-2',
          props.class,
        )
      "
    >
      <header class="flex items-center justify-between border-b border-gray-300 px-6 py-2">
        <h2 class="text-body1 text-gray-900">
          {{ title }}
        </h2>
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-md text-2xl leading-none text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
          @click="onClose"
        >
          ×
        </button>
      </header>

      <div class="px-4 py-6 lg:p-6">
        <p class="text-body2 pb-4 lg:pb-6 text-gray-700">
          {{ message }}
        </p>

        <div class="flex flex-col gap-4 lg:flex-row">
          <template v-if="leftIsPrimary">
            <PrimaryButton class="h-[56px] lg:h-15 w-full! lg:flex-1 lg:min-w-0" @click="onLeftClick">
              {{ leftText }}
            </PrimaryButton>
            <SecondaryButton class="h-[56px] lg:h-15 w-full! lg:flex-1 lg:min-w-0" @click="onRightClick">
              {{ rightText }}
            </SecondaryButton>
          </template>
          <template v-else>
            <SecondaryButton class="h-[56px] lg:h-15 w-full! lg:flex-1 lg:min-w-0" @click="onLeftClick">
              {{ leftText }}
            </SecondaryButton>
            <PrimaryButton class="h-[56px] lg:h-15 w-full! lg:flex-1 lg:min-w-0" @click="onRightClick">
              {{ rightText }}
            </PrimaryButton>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
