<template>
  <div class="bg-white sticky top-0 z-50 shadow-2 h-[56px] md:h-[88px]">
    <div class="max-w-8xl mx-auto px-4 md:px-40 h-full">
      <div class="flex justify-between items-center h-full">
        <!-- Logo -->
        <router-link to="/" class="text-xl font-bold">
          <img
            src="@/assets/icon-courseflow.svg"
            alt="Logo"
            class="md:h-[16px] md:w-[140px] h-[13.37px] w-[117px]"
          />
        </router-link>

        <!-- Right -->
        <div v-if="isReady" class="flex items-center gap-2 ">
          <router-link to="/courses">
            <button class="text-[14px] font-bold text-[#191C77] cursor-pointer h-[81px] w-[138px]">
              Our Courses
            </button>
          </router-link>

          <router-link to="/login">
            <PrimaryButton
              v-if="!isLogin"
              class="h-[37px] w-[74px] text-[14px] cursor-pointer"
            >
              Login
            </PrimaryButton>
          </router-link>

          <div v-if="isLogin" class="flex items-center gap-1">
            <div
              class="flex items-center cursor-pointer md:gap-3"
              @click="toggleMenu"
            >
              <div
                class="flex items-center gap-2 border rounded-full p-2 border-black w-10 h-10"
              >
                <img
                  :src="profilePic || profileIcon"
                  :alt="profilePic ? 'Profile Picture' : 'User'"
                  class="h-full w-full rounded-full object-cover"
                />
              </div>

              <span class="text-body2 text-gray-800 md:flex hidden">{{
                displayName || 'User Name'
              }}</span>

              <button class="text-2xl cursor-pointer px-2">
                <img
                  src="@/assets/icon-arrow-down.svg"
                  alt="Arrow Down"
                  class="h-[5px] w-[10px]"
                />
              </button>
            </div>

              <div
                v-if="isOpen"
                class="absolute right-0 top-15 mt-2 bg-white px-4 py-2 w-[198px] text-gray-700 shadow-lg z-50 rounded-xl"
              >
                <ul class="flex flex-col gap-3">
                  <li v-for="(menu) in menus" :key="menu.path">
                    <template v-if="menu.name === 'Logout'">
                      <button
                        class="flex items-center gap-3 py-2 w-full border-t border-gray-200 pt-4 -mx-4 px-4 cursor-pointer"
                        @click="
                          () => {
                            logout();
                            isOpen = false;
                          }
                        "
                      >
                        <img
                          :src="menu.icon"
                          :alt="menu.alt"
                          class="h-4 w-4"
                          style="
                            filter: brightness(0) saturate(100%) invert(41%)
                              sepia(0%) saturate(0%) hue-rotate(0deg)
                              brightness(95%) contrast(89%);
                          "
                        />
                        <span>{{ menu.name }}</span>
                      </button>
                    </template>
                    <template v-else>
                      <router-link
                        :to="menu.path"
                        :class="['flex items-center gap-3 py-2']"
                        @click="isOpen = false"
                      >
                        <img
                          :src="menu.icon"
                          :alt="menu.alt"
                          class="h-4 w-4"
                          style="
                            filter: brightness(0) saturate(100%) invert(69%)
                              sepia(19%) saturate(449%) hue-rotate(189deg)
                              brightness(94%) contrast(92%);
                          "
                        />
                        <span>{{ menu.name }}</span>
                      </router-link>
                    </template>
                  </li>
                </ul>
              </div>
            </div>
        <div v-else class="flex items-center gap-2 md:gap-8">
          <div class="h-9 w-16 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";
import PrimaryButton from "../base/button/PrimaryButton.vue";
import profileIcon from "@/assets/icon-profile.svg";
import myCoursesIcon from "@/assets/icon-book.svg";
import myAssignmentsIcon from "@/assets/icon-copy.svg";
import myWishlistIcon from "@/assets/icon-star.svg";
import logoutIcon from "@/assets/icon-exit.svg";

const { user, userProfile, isReady, logout } = useAuth();

const isOpen = ref(false);
const isLogin = computed(() => isReady.value && !!user.value);
const displayName = computed(() => userProfile.value?.fullName);
const profilePic = computed(() => userProfile.value?.profilePictureUrl ?? null);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const menus = [
  { name: "Profile", path: "/profile", icon: profileIcon, alt: "Profile" },
  {
    name: "My Courses",
    path: "/my-courses",
    icon: myCoursesIcon,
    alt: "My Courses",
  },
  {
    name: "My Assignments",
    path: "/my-assignments",
    icon: myAssignmentsIcon,
    alt: "My Assignments",
  },
  {
    name: "My Wishlist",
    path: "/my-wishlist",
    icon: myWishlistIcon,
    alt: "My Wishlist",
  },
  { name: "Logout", path: "/", icon: logoutIcon, alt: "Logout" },
];
</script>
