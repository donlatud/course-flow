<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import CustomInput from "@/components/base/input/CustomInput.vue";
import NumberInput from "@/components/base/input/NumberInput.vue";
import CourseMultiSelect from "@/components/base/input/CourseMultiSelect.vue";
import Modal from "@/components/base/modal/Modal.vue";
import PrimaryButton from "@/components/base/button/PrimaryButton.vue";
import SecondaryButton from "@/components/base/button/SecondaryButton.vue";
import { api } from "@/lib/api";

type DiscountType = "FIXED_AMOUNT" | "PERCENT";
type CreatePromoCodePayload = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minimumPurchaseAmount: number | null;
  courseIds: string[];
};
type CourseApiItem = {
  id: string;
  title: string;
  price: number | string | null;
};

/** Accepts API price as number or string (including comma-separated). */
function coursePriceNumber(price: CourseApiItem["price"]): number {
  if (price == null) return 0;
  if (typeof price === "number" && Number.isFinite(price)) return price;
  if (typeof price === "string") {
    const n = Number(price.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function toNumberOrNull(raw: string): number | null {
  const txt = String(raw ?? "").trim();
  if (txt === "" || txt === "-") return null;
  const n = Number(txt);
  return Number.isFinite(n) ? n : null;
}

/** Percent validation on Create: non-empty, numeric, 0–100. */
function validatePercentField(): boolean {
  const raw = String(percentValue.value ?? "").trim();
  if (raw === "" || raw === "-") {
    percentFieldError.value = "Please enter a percent value.";
    return false;
  }
  const p = Number(raw);
  if (!Number.isFinite(p)) {
    percentFieldError.value = "Please enter a valid number for percent.";
    return false;
  }
  if (p < 0) {
    percentFieldError.value = "Percent must not be less than 0.";
    return false;
  }
  if (p > 100) {
    percentFieldError.value = "Percent must not exceed 100.";
    return false;
  }
  return true;
}

/** Fixed-amount validation on Create: non-empty, numeric, ≥ 0. */
function validateFixedAmountField(): boolean {
  const raw = String(fixedAmountValue.value ?? "").trim();
  if (raw === "" || raw === "-") {
    fixedAmountFieldError.value = "Please enter the discount amount (THB).";
    return false;
  }
  const f = Number(raw);
  if (!Number.isFinite(f)) {
    fixedAmountFieldError.value = "Please enter a valid amount.";
    return false;
  }
  if (f < 0) {
    fixedAmountFieldError.value = "Amount must not be less than 0.";
    return false;
  }
  return true;
}

const router = useRouter();

const promoCode = ref("");
const minimumPurchase = ref("");
const discountType = ref<DiscountType | "">("");
const fixedAmountValue = ref("");
const percentValue = ref("");
const isSwitchDiscountTypeModalOpen = ref(false);
const isConfirmCreateModalOpen = ref(false);
const pendingDiscountType = ref<DiscountType | null>(null);
const coursesIncluded = ref<string[]>([]);
const allCourses = ref<CourseApiItem[]>([]);
const isSubmitting = ref(false);

const promoCodeError = ref("");
const minimumPurchaseError = ref("");
const discountTypeError = ref("");
const percentFieldError = ref("");
const fixedAmountFieldError = ref("");

/** null = minimum not set → show all courses */
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

/** Remount multi-select when filter options or list changes */
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

watch(promoCode, () => {
  promoCodeError.value = "";
});
watch(minimumPurchase, () => {
  minimumPurchaseError.value = "";
});
watch(discountType, () => {
  discountTypeError.value = "";
  percentFieldError.value = "";
  fixedAmountFieldError.value = "";
});
watch(percentValue, () => {
  percentFieldError.value = "";
});
watch(fixedAmountValue, () => {
  fixedAmountFieldError.value = "";
});

const hasCurrentDiscountInput = computed(() => {
  if (discountType.value === "FIXED_AMOUNT") return String(fixedAmountValue.value ?? "").trim() !== "";
  if (discountType.value === "PERCENT") return String(percentValue.value ?? "").trim() !== "";
  return false;
});

function applyDiscountTypeSwitch(nextType: DiscountType) {
  const currentType = discountType.value;
  if (currentType === "FIXED_AMOUNT") {
    fixedAmountValue.value = "";
  } else if (currentType === "PERCENT") {
    percentValue.value = "";
  }
  discountType.value = nextType;
}

function onDiscountTypeSelect(nextType: DiscountType) {
  if (discountType.value === nextType) return;
  if (hasCurrentDiscountInput.value) {
    pendingDiscountType.value = nextType;
    isSwitchDiscountTypeModalOpen.value = true;
    return;
  }
  applyDiscountTypeSwitch(nextType);
}

function cancelDiscountTypeSwitch() {
  pendingDiscountType.value = null;
  isSwitchDiscountTypeModalOpen.value = false;
}

function confirmDiscountTypeSwitch() {
  if (pendingDiscountType.value) {
    applyDiscountTypeSwitch(pendingDiscountType.value);
  }
  pendingDiscountType.value = null;
  isSwitchDiscountTypeModalOpen.value = false;
}

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

/** Returns true when all validation passes */
function validateBeforeConfirm(): boolean {
  promoCodeError.value = "";
  minimumPurchaseError.value = "";
  discountTypeError.value = "";
  percentFieldError.value = "";
  fixedAmountFieldError.value = "";

  const code = promoCode.value.trim();
  if (!code) {
    promoCodeError.value = "Please enter a promo code.";
  }

  const minPurchase = toNumberOrNull(minimumPurchase.value);
  if (minPurchase === null) {
    minimumPurchaseError.value = "Please enter the minimum purchase amount (THB).";
  } else if (minPurchase < 0) {
    minimumPurchaseError.value = "Minimum purchase must not be less than 0.";
  }

  const dtype = discountType.value;
  if (dtype !== "PERCENT" && dtype !== "FIXED_AMOUNT") {
    discountTypeError.value = "Please select a discount type.";
  } else if (dtype === "PERCENT") {
    validatePercentField();
  } else {
    validateFixedAmountField();
  }

  return (
    !promoCodeError.value
    && !minimumPurchaseError.value
    && !discountTypeError.value
    && !percentFieldError.value
    && !fixedAmountFieldError.value
  );
}

function handleCreateClick() {
  if (isSubmitting.value) return;
  if (!validateBeforeConfirm()) return;
  isConfirmCreateModalOpen.value = true;
}

function cancelConfirmCreate() {
  isConfirmCreateModalOpen.value = false;
}

async function confirmCreatePromo() {
  if (isSubmitting.value) return;
  if (!validateBeforeConfirm()) {
    isConfirmCreateModalOpen.value = false;
    return;
  }
  isConfirmCreateModalOpen.value = false;

  const code = promoCode.value.trim();
  const fixedAmount = toNumberOrNull(fixedAmountValue.value);
  const percent = toNumberOrNull(percentValue.value);
  const minimumPurchaseAmount = toNumberOrNull(minimumPurchase.value);
  const discountValue = discountType.value === "FIXED_AMOUNT" ? fixedAmount : percent;

  if (discountValue === null || minimumPurchaseAmount === null) {
    return;
  }

  const payload: CreatePromoCodePayload = {
    code,
    discountType: discountType.value === "PERCENT" ? "PERCENTAGE" : "FIXED_AMOUNT",
    discountValue,
    minimumPurchaseAmount,
    courseIds: coursesIncluded.value,
  };

  try {
    isSubmitting.value = true;
    await api.post("/api/admin/promo-codes", payload);
    router.push({ name: "admin-promo-code" });
  } catch (error) {
    console.error("Failed to create promo code:", error);
    let detail = "Could not create the promo code. Please try again.";
    if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === "object") {
      const m = (error.response.data as { message?: unknown }).message;
      if (typeof m === "string" && m.trim() !== "") {
        detail = m;
      }
    }
    window.alert(detail);
  } finally {
    isSubmitting.value = false;
  }
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
          <PrimaryButton
            class="h-[48px]! w-[120px]! px-0!"
            :disabled="isSubmitting"
            @click="handleCreateClick"
          >
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
              :error="Boolean(promoCodeError)"
              :error-message="promoCodeError"
            />

            <NumberInput
              v-model="minimumPurchase"
              label="Minimum purchase amount (THB)*"
              placeholder=""
              :min="0"
              :error-message="minimumPurchaseError"
            />
          </div>

          <div class="mt-10">
            <p class="text-body2 font-medium text-gray-800">
              Select discount type*
            </p>

            <div class="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-2">
              <label
                class="flex items-start gap-3 bg-white py-3"
              >
                <input
                  :checked="discountType === 'FIXED_AMOUNT'"
                  type="radio"
                  value="FIXED_AMOUNT"
                  class="mt-3 h-5 w-5 shrink-0 accent-blue-500"
                  @change="onDiscountTypeSelect('FIXED_AMOUNT')"
                >
                <span class="mt-2.5 min-w-[152px] shrink-0 text-body2 text-gray-700">
                  Fixed amount (THB)
                </span>
                <NumberInput
                  v-model="fixedAmountValue"
                  class="w-full min-w-0"
                  placeholder=""
                  :clamp-to-min-max="false"
                  :allow-negative="true"
                  :disabled="discountType !== 'FIXED_AMOUNT'"
                  :error-message="fixedAmountFieldError"
                />
              </label>

              <label
                class="flex items-start gap-3 bg-white py-3"
              >
                <input
                  :checked="discountType === 'PERCENT'"
                  type="radio"
                  value="PERCENT"
                  class="mt-3 h-5 w-5 shrink-0 accent-blue-500"
                  @change="onDiscountTypeSelect('PERCENT')"
                >
                <span class="mt-2.5 min-w-[96px] shrink-0 text-body2 text-gray-700">
                  Percent (%)
                </span>
                <NumberInput
                  v-model="percentValue"
                  class="w-full min-w-0"
                  placeholder=""
                  :clamp-to-min-max="false"
                  :allow-negative="true"
                  :disabled="discountType !== 'PERCENT'"
                  :error-message="percentFieldError"
                />
              </label>
            </div>

            <p
              v-if="discountTypeError"
              class="mt-2 text-body4 text-(--color-purple)"
            >
              {{ discountTypeError }}
            </p>
          </div>

          <div class="mt-10 w-full">
            <div class="w-full ">
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

    <Modal
      v-model:open="isSwitchDiscountTypeModalOpen"
      title="Change discount type?"
      message="Switching discount type will clear the value you entered in the current type. Do you want to continue?"
      left-text="Keep current type"
      right-text="Switch"
      type="secondary"
      @left-click="cancelDiscountTypeSwitch"
      @right-click="confirmDiscountTypeSwitch"
      @close="cancelDiscountTypeSwitch"
    />

    <Modal
      v-model:open="isConfirmCreateModalOpen"
      title="Confirm promo code creation"
      message="Do you want to create this promo code?"
      left-text="Cancel"
      right-text="Confirm"
      type="secondary"
      class="max-w-[480px]"
      @left-click="cancelConfirmCreate"
      @right-click="confirmCreatePromo"
      @close="cancelConfirmCreate"
    />
  </div>
</template>
