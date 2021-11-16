<script lang="ts" setup>
import { getParamValues } from "../utils";
import { useRouter, useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();

let hash = route.hash;

const getAccessTokenFromUrl = async () => {
  try {
    const { access_token } = getParamValues(hash);

    localStorage.setItem("SPOTIFY_access_token", access_token);

    router.push("/welcome");
  } catch (error) {
    router.push("/");
  }
};

getAccessTokenFromUrl();
</script>
<template>
  <h1>Redirecting....</h1>
</template>
