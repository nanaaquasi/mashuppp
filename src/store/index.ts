import { computed, ref } from "vue";
import { deezer } from "../apis/deezer.service";
import { spotify } from "../apis/spotify.service";
import { UserModel } from "../model";

let channel = localStorage.getItem("channel");

interface StateModel {
  user: UserModel;
}

const user = JSON.parse(
  localStorage.getItem(channel + "_user") as any
) as UserModel;

const state = ref<StateModel>({
  user: user || {
    id: "",
    name: "",
    profileImage: {} as any,
  },
});

function setUser(user: UserModel) {
  localStorage.setItem(channel + "_user", JSON.stringify(user));
  state.value.user = user;
}

async function getSpotifyUser() {
  const { data } = await spotify.getCurrentUserProfile();

  const { display_name, images, id } = data;

  setUser({
    id,
    name: display_name,
    profileImage: images[0].url,
  });
}

async function getDeezerUser() {
  const { data } = await deezer.getCurrentUserProfile();

  const { name, picture, id } = data;

  setUser({
    id,
    name,
    profileImage: picture,
  });
}

async function getUserProfile() {
  switch (channel) {
    case "SPOTIFY":
      getSpotifyUser();
      break;
    case "DEEZER":
      getDeezerUser();
      break;
    default:
      break;
  }
}

function logoutUser() {
  localStorage.removeItem("SPOTIFY_access_token");
  localStorage.removeItem("SPOTIFY_user");

  state.value.user = {
    id: "",
    name: "",
    profileImage: {} as any,
  };

  window.location.href = "/";
}

const mutations = {
  setUser,
  logoutUser,
};

const actions = {
  getUserProfile,
};

const getters = {
  user: computed(() => state.value.user),
};

export { actions, getters, mutations };
