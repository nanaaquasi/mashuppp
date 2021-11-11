<script setup lang="ts">
import { ref } from "@vue/reactivity";
import Header from "../components/Header.vue";
import { useRouter } from "vue-router";
// import Header from "../components/Header.vue";s

let token = localStorage.getItem("token");
let router = useRouter();

let scope =
  "user-read-private user-read-email playlist-modify-private playlist-modify-public playlist-read-private playlist-read-collaborative";
let client_id = import.meta.env.VITE_APP_CLIENT_ID as string;
let redirect_uri = import.meta.env.VITE_APP_REDIRECT_URL as string;

let authUrl = import.meta.env.VITE_APP_AUTH_URL;
authUrl += "?response_type=token";
authUrl += "&client_id=" + encodeURIComponent(client_id);
authUrl += "&scope=" + encodeURIComponent(scope);
authUrl += "&redirect_uri=" + encodeURIComponent(redirect_uri);

const handleGrantPermission = () => {
  if (token) {
    router.push("/welcome");
    return;
  }
  window.location.href = authUrl as string;
};
</script>

<template>
  <div
    class="
      flex flex-col
      bg-gradient-to-b
      from-green-500
      via-green-600
      to-green-800
      h-screen
    "
  >
    <Header />
    <div class="py-40 px-40 flex space-y-8 flex-col items-start">
      <h2 class="font-black text-green-200 capitalize text-9xl">
        Mix it your way.
      </h2>
      <p class="w-3/4 mb-10 text-white font-bold text-5xl">
        Be a DJ of your own by creating a mix of songs from your favourite
        artists.
      </p>
      <button
        @click="handleGrantPermission()"
        class="bg bg-white text-green-900 font-extrabold py-5 px-5"
      >
        Login with Spotify
      </button>
    </div>
  </div>
</template>

<style scoped></style>
