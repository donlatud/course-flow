<template>
  <nav class="bg-white text-white shadow-2">
    <div class="max-w-8xl mx-auto px-4 md:px-[160px] py-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="text-xl font-bold">
          <img
            src="@/assets/icon-courseflow.svg"
            alt="Logo"
            class="md:h-[16px] md:w-[140px] h-[13.37px] w-[117px]"
          />
        </router-link>

        <!-- Right -->
        <div class="flex items-center gap-2 md:gap-8">
            <router-link to="/courses">
          <button class="text-[14px] font-bold text-blue-500 cursor-pointer">
            Our Courses
          </button>
          </router-link>
          <router-link to="/login">
          <PrimaryButton v-if="!isLogin" class="h-[37px] w-[74px] text-[14px] cursor-pointer">
            Login
          </PrimaryButton>
          </router-link>
          <div v-if="isLogin" class="flex items-center gap-3">
          <div  class="flex items-center gap-2 border rounded-full p-2 border-black">
            <img 
              :src="profilePic || profileIcon" 
              :alt="profilePic ? 'Profile Picture' : 'User'" 
              class="h-2.5 w-2.5 rounded-full object-cover" 
            />
            
          </div>    
          <span  class="text-[16px]  text-gray-800 md:flex hidden">User</span>
          <div v-if="isLogin" class="relative">
            <button class="text-2xl cursor-pointer px-2" @click="toggleMenu">
              <img
                src="@/assets/icon-arrow-down.svg"
                alt="Arrow Down"
                class="h-[5px] w-[10px]"
              />
            </button>
            <div v-if="isOpen" class="absolute right-0 top-15 mt-2 bg-white px-4 py-2 w-[198px] text-gray-700 shadow-lg z-50 rounded-xl">
              <ul class="flex flex-col gap-3">
                <li v-for="(menu, index) in menus" :key="menu.path">
                  <router-link
                    :to="menu.path"
                    :class="['flex items-center gap-3 py-2', index === menus.length - 1 ? 'border-t border-gray-200 pt-4 -mx-4 px-4' : '']"
                    @click="isOpen = false"
                  >
                    <img 
                      :src="menu.icon" 
                      :alt="menu.alt" 
                      :class="['h-4 w-4']" 
                      :style="menu.name === 'Logout' ? 'filter: brightness(0) saturate(100%) invert(41%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(89%);' : 'filter: brightness(0) saturate(100%) invert(69%) sepia(19%) saturate(449%) hue-rotate(189deg) brightness(94%) contrast(92%);'"
                    />
                    <span>{{ menu.name }}</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>

  </nav>
</template>

<script setup>
import { ref } from "vue";
import PrimaryButton from "../base/button/PrimaryButton.vue";
import profileIcon from "@/assets/icon-profile.svg";
import myCoursesIcon from "@/assets/icon-book.svg";
import myAssignmentsIcon from "@/assets/icon-copy.svg";
import myWishlistIcon from "@/assets/icon-star.svg";
import logoutIcon from "@/assets/icon-exit.svg";

const isOpen = ref(false);
const isLogin = ref(false);
const profilePic = ref(null); // This would come from your user data/store

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};
console.log(isOpen.value);
const menus = [
  { name: "Profile", path: "/profile", icon: profileIcon, alt: "Profile" },
  { name: "My Courses", path: "/my-courses", icon: myCoursesIcon, alt: "My Courses" },
  { name: "My Assignments", path: "/my-assignments", icon: myAssignmentsIcon, alt: "My Assignments" },
  { name: "My Wishlist", path: "/my-wishlist", icon: myWishlistIcon, alt: "My Wishlist" },
  { name: "Logout", path: "/logout", icon: logoutIcon, alt: "Logout" },
];
</script>
