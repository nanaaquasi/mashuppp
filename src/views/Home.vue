<script setup lang="ts">
import { ref } from "@vue/reactivity";
import Header from "../components/Header.vue";
import { useRouter } from "vue-router";
// import Header from "../components/Header.vue";s

let token = localStorage.getItem("SPOTIFY_access_token");

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
  console.log(token);
  if (token) {
    router.push("/welcome");
    return;
  }
  window.location.href = authUrl as string;
};
</script>

<template>
  <div class="bg-hero-bg bg-125 bg-bottom-1 flex flex-col bg-gray-900 h-screen">
    <Header />
    <div
      class="
        my-auto
        mx-auto
        text-center
        px-5
        md:px-40
        flex flex-col
        items-center
      "
    >
      <h2
        class="
          font-semibold
          subpixel-antialiased
          text-green-400
          capitalize
          text-6xl
          md:text-9xl
          leading-none
          w-full
          md:w-3/5
        "
      >
        Create your own mix.
      </h2>
      <p
        class="
          w-full
          md:w-3/6
          text-white
          font-regular
          text-xl
          md:text-3xl
          leading-snug
          mb-4
          mt-4
          md:mt-0
        "
      >
        Be a DJ of your own by creating a mix of songs from your favourite
        artists.
      </p>
      <div
        class="
          flex flex-col
          md:flex-row md:items-center
          justify-center
          space-y-5
          md:space-x-5
          mt-4
          md:mt-8
        "
      >
        <button
          @click="handleGrantPermission()"
          class="
            bg-white
            hover:bg-gray-800
            text-green-600 text-lg
            md:text-xl
            font-bold
            py-5
            px-5
          "
        >
          Login with Spotify
        </button>
        <!-- <button
          @click="handleGrantPermission()"
          class="
            bg-green-600
            hover:bg-green-800
            text-white text-xl
            font-bold
            py-5
            px-5
          "
        >
          Login with Deezer
        </button> -->
      </div>
    </div>
  </div>
</template>

<style scoped></style>
