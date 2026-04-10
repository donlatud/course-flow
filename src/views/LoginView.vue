<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import Navbar from "@/components/shared/Navbar.vue";
import CustomInput from "@/components/base/input/CustomInput.vue";
import PrimaryButton from "@/components/base/button/PrimaryButton.vue";
import GhostButton from "@/components/base/button/GhostButton.vue";
import { useAuth } from "@/composables/useAuth";
import { appToast } from "@/components/base/toast";
import { sanitizeInternalRedirect } from "@/lib/authRedirect";

// ใช้อ่าน ?redirect=... เมื่อ user ถูกส่งมาจากหน้าอื่น (เช่น กด Subscribe แล้วยังไม่ login)
const route = useRoute();
const { login, error } = useAuth();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isError = ref(false);
const submitted = ref(false);

const handleLogin = async () => {
  submitted.value = true;
  isError.value = false;
  errorMessage.value = "";

  if (!email.value || !password.value) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) return;

  // อ่านจุดหมายหลัง login จาก URL แล้วกรองก่อนส่ง — ไม่ควรส่ง route.query.redirect ดิบไปที่ useAuth
  const redirectAfter = sanitizeInternalRedirect(route.query.redirect);
  await login(email.value, password.value, redirectAfter ?? undefined);

  if (error.value) {
    isError.value = true;
    errorMessage.value =
      "Login failed. Please ensure your email and password are correct";
  } else {
    appToast.success("Login successful", "Welcome back!");
  }
};

const resetError = () => {
  submitted.value = false;
  isError.value = false;
  errorMessage.value = "";
};
</script>

<template>
  <div
    class="relative min-h-screen w-full bg-white overflow-hidden flex flex-col"
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

    <div class="relative z-10">
      <Navbar />
    </div>

    <main
      class="relative z-10 flex-1 flex items-start lg:items-center justify-center px-4 pt-9 pb-12"
    >
      <div class="w-full max-w-113.25 flex flex-col">
        <!-- Heading -->
        <div class="mb-6">
          <p
            class="text-headline3 md:text-headline2 text-blue-500 leading-tight"
          >
            Welcome back!
          </p>
        </div>

        <!-- Form -->
        <div class="flex flex-col gap-4">
          <!-- Email -->
          <CustomInput
            v-model="email"
            type="email"
            placeholder="Enter Email"
            label="Email"
            :error="isError || (submitted && !email)"
            :error-message="
              submitted && !email ? 'Please enter your email' : ''
            "
            :submitted="submitted"
            @input="resetError"
          />

          <!-- Password -->
          <CustomInput
            v-model="password"
            type="password"
            placeholder="Enter password"
            label="Password"
            :error="isError || (submitted && !password)"
            :error-message="
              submitted && !password ? 'Please enter your password' : ''
            "
            @input="resetError"
          />

          <!-- Error message box -->
          <div
            v-if="isError"
            class="flex items-start gap-3 px-4 py-3 rounded-[10px] bg-purple/20 my-5"
          >
            <span
              class="mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-(--color-purple) text-white text-[14px] font-bold select-none pointer-events-none z-10"
            >
              !
            </span>
            <p class="text-body3 text-purple">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Login button -->
          <PrimaryButton
            class="w-full! h-14! rounded-[10px]! mt-2"
            @click="handleLogin"
          >
            Log in
          </PrimaryButton>

          <!-- Register link -->
          <p class="text-body3 text-black">
            Don't have an account?
            <RouterLink to="/register">
              <GhostButton>Register</GhostButton>
            </RouterLink>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
