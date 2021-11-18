<script setup lang="ts">
import { ref } from "@vue/reactivity";
import Header from "../components/Header.vue";
import { useRouter } from "vue-router";
import { spotify } from "../apis/spotify.service";
import { deezer } from "../apis/deezer.service";
// import Header from "../components/Header.vue";s

let router = useRouter();

const handleGrantPermission = (channel: string) => {
  localStorage.setItem("channel", channel);
  let token = localStorage.getItem(channel + "_access_token");

  if (token) {
    router.push("/welcome");
    return;
  }

  switch (channel) {
    case "SPOTIFY":
      window.location.href = spotify.authUrl as string;
      break;
    case "DEEZER":
      console.log(deezer.authUrl);
      window.location.href = deezer.authUrl as string;
      break;
    default:
      break;
  }
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
          text-transparent
          bg-clip-text bg-gradient-to-br
          from-green-200
          to-green-500
          capitalize
          text-6xl
          md:text-8xl
          leading-none
          w-full
          md:w-9/12
        "
      >
        Create your own mix.
      </h2>
      <p
        class="
          w-full
          md:w-3/5
          text-white
          font-regular
          text-xl
          md:text-2xl
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
          space-y-4
          md:space-y-0 md:space-x-5
          mt-4
          md:mt-8
        "
      >
        <div class="flex flex-col justify-center">
          <button
            @click="handleGrantPermission('SPOTIFY')"
            class="
              bg-white
              hover:bg-gray-800
              text-green-600 text-lg
              md:text-lg
              font-bold
              py-4
              px-4
              flex
              items-center
              space-x-2
            "
          >
            Login with Spotify
            <img
              class="w-10 h-10 ml-2"
              src="https://img.icons8.com/fluency/48/000000/spotify.png"
            />
          </button>
          <p class="text-center text-white mt-2 hidden md:block">&nbsp</p>
        </div>
        <div class="flex flex-col justify-center">
          <button
            @click="handleGrantPermission('DEEZER')"
            class="
              bg-green-600
              hover:bg-green-800
              text-white
              md:text-lg
              text-lg
              font-bold
              py-4
              px-4
              flex
              items-center
              space-x-2
            "
            disabled
          >
            Login with Deezer

            <img
              class="w-10 h-10 ml-2 bg-white p-1 rounded-full"
              src="https://iconape.com/wp-content/png_logo_vector/deezer-icon.png"
            />
          </button>
          <p class="text-center text-white mt-2">Coming soon 🥳</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
