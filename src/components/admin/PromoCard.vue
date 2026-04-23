<script setup lang="ts">
import { ref } from "vue";
import CustomInput from "@/components/base/input/CustomInput.vue";
import NumberInput from "@/components/base/input/NumberInput.vue";
import Modal from "@/components/base/modal/Modal.vue";


const promoCode = defineModel<string>("promoCode", { default: "" });
const minPurchase = defineModel<string>("minPurchase", { default: "" });
const discountType = defineModel<"THB" | "%">("discountType", {
  default: "THB",
});
const discountThb = defineModel<string>("discountThb", { default: "" });
const discountPercent = defineModel<string>("discountPercent", {
  default: "",
});



const showSwitchModal = ref(false);
const pendingSwitchType = ref<"THB" | "%" | null>(null);

function hasValue(type: "THB" | "%"): boolean {
  const val = type === "THB" ? discountThb.value : discountPercent.value;
  return String(val ?? "").trim() !== "";
}

function handleTypeChange(newType: "THB" | "%") {
  if (discountType.value === newType) return;
  if (hasValue(discountType.value)) {
    pendingSwitchType.value = newType;
    showSwitchModal.value = true;
    return;
  }
  applySwitch(newType);
}

function cancelSwitch() {
  pendingSwitchType.value = null;
  showSwitchModal.value = false;
}

function confirmSwitch() {
  if (pendingSwitchType.value) {
    applySwitch(pendingSwitchType.value);
  }
  pendingSwitchType.value = null;
  showSwitchModal.value = false;
}

function applySwitch(newType: "THB" | "%") {
  if (discountType.value === "THB") {
    discountThb.value = "";
  } else {
    discountPercent.value = "";
  }
  discountType.value = newType;
}
</script>

<template>
  <div
    class="w-full rounded-lg bg-[#F6F7FC] pt-6 pb-8 px-8"
    role="region"
    aria-label="Promo code settings"
  >
    <h2 class="mb-6 text-[20px] font-semibold leading-tight text-gray-900">
      Promo Code
    </h2>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <CustomInput
        v-model="promoCode"
        label="Set promo code*"
        placeholder="Enter promo code"
      />
      <NumberInput
        v-model="minPurchase"
        label="Minimum purchase amount (THB)*"
        placeholder="0"
        supporting-text="Please enter numbers only"
        :min="0"
        :step="1"
        class="h-12"
      />
    </div>

    <div class="mt-10">
      <p class="text-body2 font-medium text-gray-800">
        Select discount type*
      </p>

      <div class="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <label
          class="flex items-start gap-3  py-3"
        >
          <input
            :checked="discountType === 'THB'"
            type="radio"
            value="THB"
            class="mt-3 h-5 w-5 shrink-0 accent-blue-500"
            @change="handleTypeChange('THB')"
          >
          <span class="mt-2.5 min-w-[152px] shrink-0 text-body2 text-gray-700">
            Fixed amount (THB)
          </span>
          <NumberInput
            v-model="discountThb"
            class="w-full min-w-0"
            placeholder="0"
            supporting-text="Please enter numbers only"
            :min="0"
            :step="0.01"
            :disabled="discountType !== 'THB'"
          />
        </label>

        <label
          class="flex items-start gap-3  py-3"
        >
          <input
            :checked="discountType === '%'"
            type="radio"
            value="%"
            class="mt-3 h-5 w-5 shrink-0 accent-blue-500"
            @change="handleTypeChange('%')"
          >
          <span class="mt-2.5 min-w-[96px] shrink-0 text-body2 text-gray-700">
            Percent (%)
          </span>
          <NumberInput
            v-model="discountPercent"
            class="w-full min-w-0"
            placeholder="e.g. 10"
            supporting-text="0-100"
            :min="0"
            :max="100"
            :step="0.01"
            :disabled="discountType !== '%'"
          />
        </label>
      </div>
    </div>
  </div>

  <Modal
    v-model:open="showSwitchModal"
    title="Change discount type?"
    message="Switching discount type will clear the value you entered in the current type. Do you want to continue?"
    left-text="Keep current type"
    right-text="Switch"
    type="secondary"
    @left-click="cancelSwitch"
    @right-click="confirmSwitch"
  />
</template>
