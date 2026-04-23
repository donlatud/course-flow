<script setup lang="ts">
/**
 * หน้าล้มเหลวหลังจ่าย — รับ `?reason=` และ `?orderId=` (Phase C: กลับ checkout พร้อม order เดิมถ้ายังจัดการได้)
 */
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import Navbar from "@/components/shared/Navbar.vue"
import AppFooter from "@/components/shared/AppFooter.vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import GhostButton from "@/components/base/button/GhostButton.vue"
import { XCircleIcon } from "@heroicons/vue/16/solid"
import backgroundCourses from "@/assets/images/background-courses.svg"

const route = useRoute()
const router = useRouter()

const courseId = computed(() =>
  typeof route.params.courseId === "string" ? route.params.courseId : "",
)

const orderIdQuery = computed(() => {
  const raw = route.query.orderId
  if (Array.isArray(raw)) return typeof raw[0] === "string" ? raw[0].trim() : ""
  return typeof raw === "string" ? raw.trim() : ""
})

/** Raw `reason` from `?reason=` (payment failure message, order status code, etc.) */
const reasonParam = computed(() => {
  const raw = route.query.reason
  if (Array.isArray(raw)) return typeof raw[0] === "string" ? raw[0] : ""
  return typeof raw === "string" ? raw : ""
})

const DEFAULT_DETAIL =
  "Please check your payment details and try again."

/**
 * ทุกกรณีใช้ข้อความเดียวกับ DEFAULT_DETAIL — ยกเว้น reason เป็นรหัส EXPIRED หรือ FAILED ให้ใช้ข้อความเฉพาะ
 */
const failureDetail = computed(() => {
  const r = reasonParam.value.trim()
  if (!r) return DEFAULT_DETAIL

  const upper = r.toUpperCase()
  if (upper === "EXPIRED") {
    return "This order has expired. Go back to checkout to start a new order."
  }
  if (upper === "FAILED") {
    return "Payment could not be completed. Try again or use a different card."
  }

  return DEFAULT_DETAIL
})

const goBack = () => {
  router.back()
}

const goToCheckout = () => {
  router.push({
    name: "payment-checkout",
    params: { courseId: courseId.value },
    query: orderIdQuery.value ? { orderId: orderIdQuery.value } : {},
  })
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <Navbar />

    <main class="relative flex-1 px-4 py-6 lg:px-10 lg:pt-6 lg:pb-24 xl:px-40">
      <div class="mx-auto w-[375px] lg:w-[739px]">
        <GhostButton class="mb-8 inline-flex h-auto! w-auto! items-center gap-2 px-2 py-1 lg:hidden" @click="goBack">
          <span aria-hidden="true">&larr;</span>
          <span>Back</span>
        </GhostButton>

        <img :src="backgroundCourses" alt=""
          class="pointer-events-none absolute left-1/2 top-24 hidden w-full -translate-x-1/2 lg:block" />

        <div class="flex items-center justify-center lg:min-h-[520px]">
          <div class="w-full rounded-[8px] bg-white p-10 gap-12 shadow-1 flex flex-col items-center text-center">
            <div class="flex flex-col items-center justify-center gap-6">
              <XCircleIcon class="h-18.5 w-18.5 stroke-[0.8px] stroke-purple text-purple" />

              <div class="flex flex-col items-center justify-center gap-2">
                <h1 class="w-[263px] text-headline3 text-black lg:w-auto">
                  Payment failed.
                </h1>
                <p class="w-[263px] text-body2 text-gray-700 lg:w-auto">
                  {{ failureDetail }}
                </p>
              </div>
            </div>

            <div class="flex w-full flex-col gap-4 pt-1">
              <PrimaryButton class="w-full px-8 py-[18px] lg:w-[321.5px] lg:mx-auto" @click="goToCheckout">
                Back to Payment
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
