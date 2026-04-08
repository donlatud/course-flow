<script setup lang="ts">
import { ref } from "vue";
import Navbar from "@/components/shared/Navbar.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import CustomInput from "@/components/base/input/CustomInput.vue";
// ✅ Import ปฏิทินตัวใหม่
import CustomDatePicker from "@/components/base/input/CustomDatePicker.vue"; 

// ข้อมูลจำลอง (ปรับ dob ให้เป็น Date Object)
const profileData = ref({
  name: "Max Mayfield",
  // ✅ ปรับเป็น Date object เพื่อให้ใช้กับ DatePicker ได้ (16 April 2002)
  dob: new Date(2002, 3, 16), 
  education: "Hawkins High School",
  email: "max@mayfield.com",
  profileImage: "/src/assets/images/profile_test.svg",
});

const isSubmitted = ref(false);

const handleUpdateProfile = () => {
  isSubmitted.value = true;
  // ตรวจสอบค่าก่อนส่ง
  console.log("Saving Date:", profileData.value.dob); 
};

// ... (ฟังก์ชันจัดการรูปภาพเหมือนเดิม) ...
const triggerFileInput = () => document.getElementById("file-input")?.click();
const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => profileData.value.profileImage = e.target?.result as string;
    reader.readAsDataURL(file);
  }
};
const removePhoto = () => profileData.value.profileImage = "";
</script>

<template>
  <div class="relative min-h-screen w-full bg-white flex flex-col">
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <img
        src="@/assets/images/background-courses-mobile.svg"
        alt=""
        class="absolute w-full block xl:hidden"
        style="top: 116px"
      />
      <img
        src="@/assets/images/background-courses.svg"
        alt=""
        class="absolute 2xl:w-full hidden xl:block"
        style="top: 196px; left: 43px"
      />
    </div>

    <div>
      <Navbar />
    </div>

    <main class="relative z-10 flex-1 flex flex-col items-center px-4 lg:pt-20 pt-10 pb-20">
      <div class="w-full max-w-[1000px]">
        <h1 class="lg:text-headline2 text-headline3 text-gray-900 text-center lg:mb-16 mb-8">
          Profile
        </h1>

        <div class="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
          
          <div class="flex flex-col items-center shrink-0">
            <div class="relative w-64 h-64 lg:w-80 lg:h-80 mb-6 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
              <img :src="profileData.profileImage || 'https://via.placeholder.com/400'" class="w-full h-full " />
            </div>
            <input id="file-input" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            <button @click="triggerFileInput" class="w-full max-w-[200px] h-12 mb-4 rounded-xl bg-[#3B69B4] text-white font-semibold cursor-pointer">
              Change photo
            </button>
            <button @click="removePhoto" class="text-blue-600 font-semibold cursor-pointer">
              Remove photo
            </button>
          </div>

          <div class="flex-1 w-full flex flex-col gap-6">
            <CustomInput 
              v-model="profileData.name"
              label="Name"
              placeholder="Enter Name and Lastname"
              :submitted="isSubmitted"
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
            />

            <CustomInput 
              v-model="profileData.email"
              label="Email"
              placeholder="Enter Email"
              type="email"
              :submitted="isSubmitted"
            />

            <button 
              @click="handleUpdateProfile"
              class="w-full h-12 mt-4 rounded-xl bg-[#3B69B4] text-white font-semibold hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
            >
              Update Profile
            </button>
          </div>

        </div>
      </div>
    </main>

    <div class="relative z-10">
      <AppFooter />
    </div>
  </div>
</template>