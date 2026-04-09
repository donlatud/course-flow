<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import CustomInput from "@/components/base/input/CustomInput.vue";
import NumberInput from "@/components/base/input/NumberInput.vue";
import CourseMultiSelect from "@/components/base/input/CourseMultiSelect.vue";
import PrimaryButton from "@/components/base/button/PrimaryButton.vue";
import SecondaryButton from "@/components/base/button/SecondaryButton.vue";
import { api } from "@/lib/api";

type DiscountType = "FIXED_AMOUNT" | "PERCENT";
type CourseApiItem = {
  id: string;
  title: string;
  price: number | string | null;
};

/** รองรับตัวเลขจาก API เป็น number หรือ string (รวมมี comma) */
function coursePriceNumber(price: CourseApiItem["price"]): number {
  if (price == null) return 0;
  if (typeof price === "number" && Number.isFinite(price)) return price;
  if (typeof price === "string") {
    const n = Number(price.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

const router = useRouter();

const promoCode = ref("");
const minimumPurchase = ref("");
const discountType = ref<DiscountType | "">("");
const fixedAmountValue = ref("");
const percentValue = ref("");
const coursesIncluded = ref<string[]>([]);
const allCourses = ref<CourseApiItem[]>([]);

/** null = ยังไม่กรอก minimum → แสดงคอร์สทั้งหมด */
const minPurchaseValue = computed(() => {
  const raw = String(minimumPurchase.value ?? "").trim();
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
});

const filteredCourses = computed(() => {
  const min = minPurchaseValue.value;
  if (min === null) return allCourses.value;
  return allCourses.value.filter(
    (course) => coursePriceNumber(course.price) >= min,
  );
});

/** remount multi-select เมื่อเงื่อนไขกรอง/รายการเปลี่ยน */
const courseSelectKey = computed(
  () =>
    `${minPurchaseValue.value ?? "all"}:${filteredCourses.value.map((c) => c.id).join(",")}`,
);

const courseMultiOptions = computed(() =>
  filteredCourses.value.map((course) => ({
    id: course.id,
    title: course.title,
    listLabel: `${course.title} (${coursePriceNumber(course.price).toLocaleString("en-US")} THB)`,
  })),
);

watch(
  () => filteredCourses.value.map((c) => c.id).join(","),
  () => {
    const allow = new Set(filteredCourses.value.map((c) => c.id));
    coursesIncluded.value = coursesIncluded.value.filter((id) => allow.has(id));
  },
);

async function fetchCourses() {
  try {
    const { data } = await api.get<CourseApiItem[]>("/api/admin/courses");
    allCourses.value = (data ?? []).map((course: CourseApiItem) => ({
      id: String(course.id),
      title: course.title,
      price: course.price,
    }));
  } catch (error) {
    console.error("Failed to fetch courses for promo create page:", error);
    allCourses.value = [];
  }
}

function goBackToPromoList() {
  router.push({ name: "admin-promo-code" });
}

function handleCreate() {
  // Mock flow for now: keep values in UI only, then return to list.
  router.push({ name: "admin-promo-code" });
}

onMounted(fetchCourses);
</script>

<template>
  <div class="flex justify-center pl-60">
    <section class="w-full max-w-[1920px] min-h-screen bg-gray-100">
      <div
        class="mx-auto flex h-[92px] w-full items-center justify-between border-b border-gray-200 bg-white px-8"
      >
        <h1 class="text-headline3 text-gray-900">
          Add Promo code
        </h1>

        <div class="flex items-center gap-4">
          <SecondaryButton class="h-[48px]! w-[104px]! px-0!" @click="goBackToPromoList">
            Cancel
          </SecondaryButton>
          <PrimaryButton class="h-[48px]! w-[120px]! px-0!" @click="handleCreate">
            Create
          </PrimaryButton>
        </div>
      </div>

      <div class="px-8 py-8">
        <div class="w-full rounded-2xl border border-gray-200 bg-white px-10 py-9">
          <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <CustomInput
              v-model="promoCode"
              label="Set promo code*"
              placeholder=""
            />

            <NumberInput
              v-model="minimumPurchase"
              label="Minimum purchase amount (THB)*"
              placeholder=""
            />
          </div>

          <div class="mt-10">
            <p class="text-body2 font-medium text-gray-800">
              Select discount type*
            </p>

            <div class="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-2">
              <label
                class="flex items-center gap-3  bg-whitepy-3"
              >
                <input
                  v-model="discountType"
                  type="radio"
                  value="FIXED_AMOUNT"
                  class="h-5 w-5 accent-blue-500"
                >
                <span class="min-w-[152px] text-body2 text-gray-700">
                  Fixed amount (THB)
                </span>
                <NumberInput
                  v-model="fixedAmountValue"
                  class="w-full"
                  placeholder=""
                  :disabled="discountType !== 'FIXED_AMOUNT'"
                />
              </label>

              <label
                class="flex items-center gap-3  bg-white py-3"
              >
                <input
                  v-model="discountType"
                  type="radio"
                  value="PERCENT"
                  class="h-5 w-5 accent-blue-500"
                >
                <span class="min-w-[96px] text-body2 text-gray-700">
                  Percent (%)
                </span>
                <NumberInput
                  v-model="percentValue"
                  class="w-full"
                  placeholder=""
                  :disabled="discountType !== 'PERCENT'"
                />
              </label>
            </div>
          </div>

          <div class="mt-10 w-full">
            <div class="w-[743px] ">
              <CourseMultiSelect
                :key="courseSelectKey"
                v-model="coursesIncluded"
                label="Courses Included"
                :options="courseMultiOptions"
              />
            </div>
    
            <p class="mt-2 text-body4 text-gray-500">
              When minimum purchase is set, only courses with price greater than or equal to that amount are listed.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
