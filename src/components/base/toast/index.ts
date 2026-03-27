import type { Component } from "vue"
import { markRaw } from "vue"
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/vue/24/solid"
import { toast } from "vue-sonner"
import Toast from "./Toast.vue"

// Keep this in sync with `.animate-app-toast-progress` duration in `src/style.css`.
const DEFAULT_DURATION = 4000

const DESCRIPTION_CLASS = "!text-body4 text-gray-700"

// Theme tokens for each variant. Edit these values to change toast colors.
const successPreset = {
  bgClass: "bg-[#D5EEE8]",
  borderClass: "border-green",
  iconBgClass: "bg-green/20",
  iconColorClass: "text-green",
  titleClass: "text-body2 text-green",
  descriptionClass: DESCRIPTION_CLASS,
  closeColorClass: "text-green",
  closeHoverClass: "hover:bg-green hover:text-white",
  trackClass: "stroke-green/30",
  progressClass: "text-green/50",
} as const

const errorPreset = {
  bgClass: "bg-[#EBD5EE]",
  borderClass: "border-purple",
  iconBgClass: "bg-purple/20",
  iconColorClass: "text-purple",
  titleClass: "text-body2 text-purple",
  descriptionClass: DESCRIPTION_CLASS,
  closeColorClass: "text-purple",
  closeHoverClass: "hover:bg-purple hover:text-white",
  trackStroke: "url(#toast-error-track)",
  trackClass: "stroke-purple/30",
  progressClass: "text-purple/50",
} as const

// Internal helper that maps variant -> preset/icon and triggers vue-sonner custom toast.
function push(
  variant: "success" | "error",
  title: string,
  description?: string,
  icon?: string | Component,
) {
  const preset = variant === "success" ? successPreset : errorPreset
  const defaultIcon = variant === "success" ? CheckCircleIcon : ExclamationCircleIcon

  toast.custom(markRaw(Toast), {
    duration: DEFAULT_DURATION,
    unstyled: true,
    componentProps: {
      title,
      description,
      icon: icon ?? markRaw(defaultIcon),
      ...preset,
    },
  })
}

/**
 * App-level toast API.
 *
 * Usage:
 * - In page/component script:
 *   `import { appToast, Toaster } from "@/components/base/toast"`
 * - Trigger toast:
 *   `appToast.success("Success", "Saved successfully")`
 *   `appToast.error("Error", "Please try again")`
 *
 * Notes:
 * - `Toaster` must be mounted once in app layout/root (e.g. App.vue template).
 * - Prefer using this wrapper instead of calling `toast.custom` directly.
 */
export const appToast = {
  success: (title: string, description?: string, icon?: string | Component) =>
    push("success", title, description, icon),

  error: (title: string, description?: string, icon?: string | Component) =>
    push("error", title, description, icon),
}

/** Re-export Toaster so consumers import from one module. */
export { Toaster } from "@/components/ui/sonner"
export { default as Toast } from "./Toast.vue"
export type { ToastPreset } from "./Toast.vue"
