import { computed, ref } from "vue";
import { getCurrentUserProfile } from "../apis/spotify.service";
import { UserModel } from "../model";

interface StateModel {
  user: UserModel;
}

const state = ref<StateModel>({
  user: {
    id: "",
    name: "",
    profileImage: {} as any,
  },
});

function setUser(user: UserModel) {
  state.value.user = user;
}

async function getUserProfile() {
  const { data } = await getCurrentUserProfile();

  const { display_name, images, id } = data;

  setUser({
    id,
    name: display_name,
    profileImage: images[0].url,
  });
}

function logoutUser() {
  localStorage.removeItem("access_token");
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
