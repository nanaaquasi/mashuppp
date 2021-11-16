<script lang="ts" setup>
import { getParamValues } from "../utils";
import { useRouter, useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();
const channel = localStorage.getItem("channel");
let hash = route.hash;

const { access_token } = getParamValues(hash);

const getAccessTokenFromUrl = async () => {
  try {
    localStorage.setItem(channel + "_access_token", access_token);
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
