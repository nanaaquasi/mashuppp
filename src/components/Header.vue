<script lang="ts" setup>
import { ref } from "@vue/reactivity";
import { RouterLink } from "vue-router";
import { getters, mutations } from "../store";

const { user } = getters;
const { logoutUser } = mutations;

const isDropdownShown = ref(false);

const showDropdown = () => {
  isDropdownShown.value = !isDropdownShown.value;
};
</script>
<template>
  <div class="w-screen px-40 flex bg-black items-center justify-between h-16">
    <h1 class="p-0 m-0 text-3xl text-white font-extrabold">Mashuppp.</h1>
    <ul class="flex items-center justify-between text-white font-bold w-1/5">
      <router-link class="hover:text-green-400" to="/">Home</router-link>
      <router-link class="hover:text-green-400" to="/about">About</router-link>
      <div class="group flex relative flex-col">
        <div
          v-if="user.id !== ''"
          @click="showDropdown"
          class="flex items-center space-x-3 cursor-pointer"
        >
          <div>
            <img class="w-10 h-10 rounded-full" :src="user.profileImage" />
          </div>
          <li class="hover:text-green-400" to="/profile">Profile</li>
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
          <li class="hover:text-gray-800">Account</li>
          <li class="hover:text-gray-800" @click="logoutUser">Logout</li>
        </ul>
      </div>
    </ul>
  </div>
</template>
