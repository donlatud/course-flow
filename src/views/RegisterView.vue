<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import Navbar from "@/components/shared/Navbar.vue";
import CustomInput from "@/components/base/input/CustomInput.vue";
import CustomDatePicker from "@/components/base/input/CustomDatePicker.vue";
import PrimaryButton from "@/components/base/button/PrimaryButton.vue";
import GhostButton from "@/components/base/button/GhostButton.vue";
import { api } from "@/lib/api";
import { useAuth } from "@/composables/useAuth";

const { login } = useAuth();

const name = ref("");
const dateOfBirth = ref<Date | undefined>(undefined);
const educationalBackground = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const submitted = ref(false);

const passwordMismatch = computed(
  () => submitted.value && confirmPassword.value !== password.value,
);

const handleRegister = async () => {
  submitted.value = true;

  if (
    !name.value ||
    !dateOfBirth.value ||
    !educationalBackground.value ||
    !email.value ||
    !password.value ||
    !confirmPassword.value ||
    password.value !== confirmPassword.value
  )
    return;

  try {
    // คำนวณ age จาก dateOfBirth
    const age = new Date().getFullYear() - dateOfBirth.value.getFullYear();

    // ส่งไปที่ Spring Boot
    await api.post("/api/auth/register", {
      email: email.value,
      password: password.value,
      fullName: name.value,
      age: age,
      educationalBackground: educationalBackground.value,
    });

    await login(email.value, password.value);
  } catch (error: any) {
    errorMessage.value = "Register failed. Please try again.";
  }
};

const resetError = () => {
  submitted.value = false;
  errorMessage.value = "";
};
</script>

<template>
  <div
    class="relative min-h-screen w-full bg-white flex flex-col"
  >
    <!-- Background images -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <img
        src="@/assets/background-login-mobile.svg"
        alt=""
        class="absolute inset-0 w-full h-full block min-[425px]:hidden pt-45"
      />
      <img
        src="@/assets/background-login.svg"
        alt=""
        class="absolute inset-0 w-full h-full xl:object-cover hidden min-[425px]:block"
      />
    </div>

    <Navbar />

    <main
      class="relative z-10 flex-1 flex items-start lg:items-center justify-center px-4 pt-9 pb-12"
    >
      <div class="w-full max-w-113.25 flex flex-col">
        <!-- Heading -->
        <div class="mb-6">
          <p
            class="text-headline3 md:text-headline2 text-blue-500 leading-tight"
          >
            Register to start learning!
          </p>
        </div>

        <!-- Form -->
        <div class="flex flex-col gap-4">
          <!-- Name -->
          <CustomInput
            v-model="name"
            placeholder="Enter Name and Lastname"
            label="Name"
            :error="submitted && !name"
            :error-message="submitted && !name ? 'Please enter your name' : ''"
            @input="resetError"
          />

          <!-- Date of Birth -->
          <CustomDatePicker
            v-model="dateOfBirth"
            placeholder="DD/MM/YY"
            label="Date of Birth"
            :error="submitted && !dateOfBirth"
            :error-message="
              submitted && !dateOfBirth
                ? 'Please select your date of birth'
                : ''
            "
          />

          <!-- Educational Background -->
          <CustomInput
            v-model="educationalBackground"
            placeholder="Enter Educational Background"
            label="Educational Background"
            :error="submitted && !educationalBackground"
            :error-message="
              submitted && !educationalBackground
                ? 'Please enter your educational background'
                : ''
            "
            @input="resetError"
          />

          <!-- Email -->
          <CustomInput
            v-model="email"
            type="email"
            placeholder="Enter Email"
            label="Email"
            :error="submitted && !email"
            :submitted="submitted"
            @input="resetError"
          />

          <!-- Password -->
          <CustomInput
            v-model="password"
            type="password"
            placeholder="Enter password"
            label="Password"
            :error="submitted && !password"
            :error-message="
              submitted && !password ? 'Please enter your password' : ''
            "
            @input="resetError"
            :submitted="submitted"
          />

          <!-- Confirm Password -->
          <CustomInput
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm password"
            label="Confirm Password"
            :error="passwordMismatch || (submitted && !confirmPassword)"
            :error-message="passwordMismatch ? 'Passwords do not match' : ''"
            @input="resetError"
          />

          <!-- Register button -->
          <PrimaryButton
            class="w-full! h-14! rounded-[10px]! mt-2"
            @click="handleRegister"
          >
            Register
          </PrimaryButton>

          <!-- Login link -->
          <p class="text-body3 text-black">
            Already have an account?
            <RouterLink to="/login">
              <GhostButton>Log in</GhostButton>
            </RouterLink>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
