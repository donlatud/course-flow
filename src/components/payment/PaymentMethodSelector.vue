<script setup lang="ts">
import CustomInput from "@/components/base/input/CustomInput.vue"
import visaCard from "@/assets/icon-card-visa.svg"
import masterCard from "@/assets/icon-card-mastercard.svg"

defineProps<{
  cardNumber: string
  nameOnCard: string
  expiryDate: string
  cvv: string
  cardNumberError: boolean
  cardNumberErrorMessage: string
  nameOnCardError: boolean
  nameOnCardErrorMessage: string
  expiryDateError: boolean
  expiryDateErrorMessage: string
  cvvError: boolean
  cvvErrorMessage: string
  selectedPaymentMethod: "card" | "qr"
}>()

const emit = defineEmits<{
  (e: "update:cardNumber", value: string): void
  (e: "update:nameOnCard", value: string): void
  (e: "update:expiryDate", value: string): void
  (e: "update:cvv", value: string): void
  (e: "select-payment-method", value: "card" | "qr"): void
}>()
</script>

<template>
  <section>
    <p class="mb-4 text-body2 text-gray-700">Select payment method</p>

    <div
      :class="[
        'rounded-[8px] p-4 lg:p-8',
        selectedPaymentMethod === 'card' ? 'bg-gray-200' : 'bg-transparent',
      ]"
    >
      <button
        type="button"
        class="mb-6 flex items-center gap-3 text-body2 text-gray-900 cursor-pointer"
        @click="emit('select-payment-method', 'card')"
      >
        <span
          :class="[
            'flex h-5 w-5 items-center justify-center rounded-full border-2',
            selectedPaymentMethod === 'card' ? 'border-blue-500' : 'border-black',
          ]"
        >
          <span
            v-if="selectedPaymentMethod === 'card'"
            class="h-2.5 w-2.5 rounded-full bg-blue-500"
          />
        </span>
        <span>Credit card / Debit card</span>
      </button>

      <div class="space-y-5 lg:pl-8">
        <div class="lg:max-w-[611px] lg:flex lg:flex-row lg:gap-4">
          <div class="lg:max-w-[453px] lg:flex lg:flex-col">
            <p class="mb-2 text-body2 text-black">Card number</p>
            <CustomInput
              :model-value="cardNumber"
              :error="cardNumberError"
              :error-message="cardNumberErrorMessage"
              placeholder="Card number"
              class="lg:w-[453px]"
              @update:model-value="emit('update:cardNumber', String($event))"
            />
          </div>
          <div class="lg:mt-8 flex items-center gap-2">
            <img :src="visaCard" alt="Visa" class="h-12 w-12 object-contain" />
            <img :src="masterCard" alt="Mastercard" class="h-12 w-12 object-contain" />
          </div>
        </div>

        <div>
          <p class="mb-2 text-body2 text-black">Name on card</p>
          <CustomInput
            :model-value="nameOnCard"
            :error="nameOnCardError"
            :error-message="nameOnCardErrorMessage"
            placeholder="Name on card"
            class="lg:w-[453px]"
            @update:model-value="emit('update:nameOnCard', String($event))"
          />
        </div>

        <div class="grid grid-cols-2 gap-4 lg:w-[453px]">
          <div>
            <p class="mb-2 text-body2 text-black">Expiry date</p>
            <CustomInput
              :model-value="expiryDate"
              :error="expiryDateError"
              :error-message="expiryDateErrorMessage"
              placeholder="MM/YY"
              @update:model-value="emit('update:expiryDate', String($event))"
            />
          </div>

          <div>
            <p class="mb-2 text-body2 text-black">CVV</p>
            <CustomInput
              :model-value="cvv"
              :error="cvvError"
              :error-message="cvvErrorMessage"
              placeholder="CVV"
              @update:model-value="emit('update:cvv', String($event))"
            />
          </div>
        </div>
      </div>
    </div>

    <button
      type="button"
      :class="[
        'mt-6 flex w-full items-center gap-3 rounded-[8px] px-4 py-4 text-left text-body2 text-gray-900 cursor-pointer lg:px-8',
        selectedPaymentMethod === 'qr' ? 'bg-gray-200' : 'bg-transparent',
      ]"
      @click="emit('select-payment-method', 'qr')"
    >
      <span
        :class="[
          'flex h-5 w-5 items-center justify-center rounded-full border-2',
          selectedPaymentMethod === 'qr' ? 'border-blue-500' : 'border-black',
        ]"
      >
        <span
          v-if="selectedPaymentMethod === 'qr'"
          class="h-2.5 w-2.5 rounded-full bg-blue-500"
        />
      </span>
      <span>QR Payment</span>
    </button>
  </section>
</template>
