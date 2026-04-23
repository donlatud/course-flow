<script setup lang="ts">
import { ref, watchEffect } from "vue";
import Navbar from "@/components/shared/Navbar.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import CustomInput from "@/components/base/input/CustomInput.vue";
import CustomDatePicker from "@/components/base/input/CustomDatePicker.vue";
import PrimaryButton from "@/components/base/button/PrimaryButton.vue";
import GhostButton from "@/components/base/button/GhostButton.vue";
import { useAuth } from "@/composables/useAuth";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { appToast } from "@/components/base/toast";

const { user, userProfile, isReady } = useAuth();

/* =============================
   STATE
============================= */

const profileData = ref({
  name: "",
  dob: undefined as Date | undefined,
  education: "",
  email: "",
  profileImage: "",
});

const currentFilePath = ref<string | null>(null);

const isSubmitted = ref(false);
const uploading = ref(false);
const saving = ref(false);

/* =============================
   LOAD PROFILE
============================= */

watchEffect(() => {
  if (!userProfile.value) return;

  profileData.value.name = userProfile.value.fullName || "";
  profileData.value.email = userProfile.value.email || "";
  profileData.value.education =
    userProfile.value.educationalBackground || "";

  profileData.value.profileImage =
    userProfile.value.profilePictureUrl || "";

  profileData.value.dob = userProfile.value.dateOfBirth
    ? new Date(userProfile.value.dateOfBirth)
    : undefined;

  // ✅ เก็บ storage path
  if (userProfile.value.profilePictureUrl) {
    const url = userProfile.value.profilePictureUrl;
    const path = url.split("/profile_image/")[1];
    currentFilePath.value = path || null;
  }
});

/* =============================
   DATE FORMAT (Fix -1 Day)
============================= */

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =============================
   UPDATE PROFILE
============================= */

const handleUpdateProfile = async () => {
  isSubmitted.value = true;

  if (
    !profileData.value.name ||
    !profileData.value.dob ||
    !profileData.value.education ||
    !profileData.value.email
  )
    return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(profileData.value.email)) return;

  saving.value = true;

  try {
    await api.put("/api/users/me", {
      fullName: profileData.value.name,
      educationalBackground: profileData.value.education,
      profilePictureUrl: profileData.value.profileImage,
      dateOfBirth: formatDateLocal(profileData.value.dob),
    });

    appToast.success(
      "Profile updated",
      "Your profile has been saved successfully"
    );
  } catch (err) {
    appToast.error("Update failed", "Please try again");
  } finally {
    saving.value = false;
  }
};

/* =============================
   FILE INPUT
============================= */

const triggerFileInput = () =>
  document.getElementById("file-input")?.click();

/* =============================
   UPLOAD PHOTO
============================= */

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !user.value) return;

  uploading.value = true;

  try {
    // ✅ ลบรูปเก่า
    if (currentFilePath.value) {
      await supabase.storage
        .from("profile_image")
        .remove([currentFilePath.value]);
    }

    const filePath = `${user.value.id}/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("profile_image")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("profile_image")
      .getPublicUrl(filePath);

    profileData.value.profileImage = data.publicUrl;
    currentFilePath.value = filePath;

    appToast.success(
      "Photo uploaded",
      "Your photo has been uploaded successfully"
    );
  } catch (err) {
    console.error(err);
    appToast.error("Upload failed", "Please try again");
  } finally {
    uploading.value = false;
  }
};

/* =============================
   REMOVE PHOTO (DELETE STORAGE)
============================= */

const removePhoto = async () => {
  if (!currentFilePath.value) return;

  try {
    const { error } = await supabase.storage
      .from("profile_image")
      .remove([currentFilePath.value]);

    if (error) throw error;

    profileData.value.profileImage = "";
    currentFilePath.value = null;

    appToast.success("Photo removed", "Profile photo deleted");
  } catch (err) {
    console.error(err);
    appToast.error("Remove failed", "Please try again");
  }
};
</script>

<template>
  <div
    v-if="isReady"
    class="relative min-h-screen w-full bg-white flex flex-col"
  >
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <img
        src="@/assets/images/background-courses-mobile.svg"
        class="absolute w-full block xl:hidden"
        style="top: 116px"
      />
      <img
        src="@/assets/images/background-courses.svg"
        class="absolute 2xl:w-full hidden xl:block"
        style="top: 196px; left: 43px"
      />
    </div>

    <Navbar />

    <main
      class="relative z-10 flex-1 flex flex-col items-center px-4 lg:pt-20 pt-10 pb-20"
    >
      <div class="w-full max-w-[1000px]">
        <h1
          class="lg:text-headline2 text-headline3 text-gray-900 text-center lg:mb-16 mb-8 font-bold"
        >
          Profile
        </h1>

        <div
          class="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20"
        >
          <div class="flex flex-col items-center shrink-0">
            <div
              class="relative w-64 h-64 lg:w-80 lg:h-80 mb-6 rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-gray-50"
            >
              <img
                :src="
                  profileData.profileImage ||
                  '/src/assets/images/empty-profile.svg'
                "
                class="w-full h-full object-cover"
              />
            </div>

            <input
              id="file-input"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />

            <PrimaryButton
              @click="triggerFileInput"
              :disabled="uploading"
              class="w-full max-w-[200px] h-12 mb-4"
            >
              {{ uploading ? "Uploading..." : "Change photo" }}
            </PrimaryButton>

            <GhostButton
              v-if="profileData.profileImage"
              @click="removePhoto"
              class="w-full max-w-[200px] h-auto text-blue-600"
            >
              Remove photo
            </GhostButton>
          </div>

          <div class="flex-1 w-full flex flex-col gap-6">
            <CustomInput
              v-model="profileData.name"
              label="Name"
              placeholder="Enter Name and Lastname"
              :submitted="isSubmitted"
              :error="isSubmitted && !profileData.name"
              :error-message="
                isSubmitted && !profileData.name ? 'Please enter your name' : ''
              "
            />

            <CustomDatePicker
              v-model="profileData.dob"
              label="Date of Birth"
              placeholder="DD/MM/YY"
              :error="isSubmitted && !profileData.dob"
              error-message="Please select your date of birth"
            />

            <CustomInput
              v-model="profileData.education"
              label="Educational Background"
              placeholder="Enter Educational Background"
              :submitted="isSubmitted"
              :error="isSubmitted && !profileData.education"
              :error-message="
                isSubmitted && !profileData.education
                  ? 'Please enter your educational background'
                  : ''
              "
            />

            <CustomInput
              v-model="profileData.email"
              label="Email"
              placeholder="Enter Email"
              type="email"
              :submitted="isSubmitted"
              :error="isSubmitted && !profileData.email"
              :error-message="
                isSubmitted && !profileData.email
                  ? 'Please enter your email'
                  : ''
              "
            />

            <PrimaryButton
              @click="handleUpdateProfile"
              :disabled="saving"
              class="w-full h-12 mt-4"
            >
              {{ saving ? "Saving..." : "Update Profile" }}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </main>

    <div class="relative z-10">
      <AppFooter />
    </div>
  </div>
</template>
