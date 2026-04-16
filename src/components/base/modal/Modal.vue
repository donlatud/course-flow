<script setup lang="ts">
/**
 * Confirm Modal (Base Component)
 *
 * Usage:
 * 1) Add open/close state in the parent.
 * 2) Bind with `v-model:open`.
 * 3) Pass props and handle events for actions.
 *
 * Props:
 * - `open` (v-model): boolean show/hide
 * - `title?`: modal title
 * - `message?`: body text
 * - `leftText?`: left button label
 * - `rightText?`: right button label
 * - `type?`: 'primary' | 'secondary'
 *   - 'primary' => left Primary, right Secondary
 *   - 'secondary' => left Secondary, right Primary
 * - `class?`: extra classes on the modal `section`
 *
 * Events:
 * - `@close`: X button
 * - `@left-click`: left button
 * - `@right-click`: right button
 *
 * Example:
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
  buttonClass?: HTMLAttributes['class']
  leftButtonClass?: HTMLAttributes['class']
  rightButtonClass?: HTMLAttributes['class']
  variant?: 'default' | 'danger'
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
            <PrimaryButton :class="cn('h-[56px] lg:h-15', props.leftButtonClass || props.buttonClass, !props.leftButtonClass && !props.buttonClass && 'w-full! lg:flex-1 lg:min-w-0')" @click="onLeftClick">
              {{ leftText }}
            </PrimaryButton>
            <SecondaryButton :class="cn('h-[56px] lg:h-15', props.rightButtonClass || props.buttonClass, !props.rightButtonClass && !props.buttonClass && 'w-full! lg:flex-1 lg:min-w-0')" @click="onRightClick">
              {{ rightText }}
            </SecondaryButton>
          </template>
          <template v-else>
            <SecondaryButton :class="cn('h-[56px] lg:h-15', props.leftButtonClass || props.buttonClass, !props.leftButtonClass && !props.buttonClass && 'w-full! lg:flex-1 lg:min-w-0')" @click="onLeftClick">
              {{ leftText }}
            </SecondaryButton>
            <PrimaryButton :class="cn('h-[56px] lg:h-15', props.rightButtonClass || props.buttonClass, !props.rightButtonClass && !props.buttonClass && 'w-full! lg:flex-1 lg:min-w-0')" @click="onRightClick">
              {{ rightText }}
            </PrimaryButton>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
