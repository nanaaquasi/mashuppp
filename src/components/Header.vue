<script lang="ts" setup>
import { ref } from "@vue/reactivity";
import { RouterLink } from "vue-router";
import { getters, mutations } from "../store";

const { user } = getters;
const { logoutUser } = mutations;

const isDropdownShown = ref(false);

const logout = () => {
  isDropdownShown.value = false;
  logoutUser();
};

const showDropdown = () => {
  isDropdownShown.value = !isDropdownShown.value;
};

const goHome = () => (window.location.href = "/");
</script>
<template>
  <div
    class="
      w-screen
      px-5
      md:px-40
      py-8
      flex
      bg-black
      items-center
      justify-between
    "
  >
    <div class="flex items-center space-x-2 cursor-pointer" @click="goHome">
      <img
        src="https://img.icons8.com/external-those-icons-fill-those-icons/24/26e07f/external-dj-party-event-those-icons-fill-those-icons.png"
      />
      <h1 class="p-0 m-0 text-xl md:text-3xl text-white font-extrabold">
        Mashuppp.
      </h1>
    </div>

    <ul class="flex items-center justify-end text-white font-bold md:w-1/5">
      <!-- <router-link class="hover:text-yellow-300" to="/">Home</router-link> -->
      <!-- <router-link class="hover:text-yellow-300" to="/about">About</router-link> -->
      <div class="group flex relative flex-col">
        <div
          v-if="user.id !== ''"
          @click="showDropdown"
          class="flex items-center space-x-3 cursor-pointer"
        >
          <div>
            <img class="w-10 h-10 rounded-full" :src="user.profileImage" />
          </div>
          <li class="hover:text-green-300 md:block" to="/profile">
            {{ user.name }}
          </li>
        </div>
        <ul
          v-if="isDropdownShown"
          class="
            absolute
            w-48
            top-12
            shadow-lg
            left-0
            bg-white
            text-gray-400
            font-semibold
            p-4
            space-y-4
            cursor-pointer
          "
        >
          <!-- <li class="hover:text-gray-800">Account</li> -->
          <li class="hover:text-gray-800" @click="logout">Logout</li>
        </ul>
      </div>
    </ul>
  </div>
</template>
