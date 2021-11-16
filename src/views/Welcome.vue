<script lang="ts" setup>
import { actions, getters } from "../store";
import Header from "../components/Header.vue";
import { computed, ref } from "@vue/reactivity";
import {
  addTracksToPlaylist,
  createUserPlaylist,
  getArtistTopTracks,
  searchArtists,
} from "../apis/spotify.service";
import { ArtistModel, TrackModel } from "../model";
import { getRandom, fancyTimeFormat } from "../utils";

const { getUserProfile } = actions;
const { user } = getters;

const searchQuery = ref("");
const errorMessage = ref("");

const searchResults = ref<ArtistModel[]>([]);
const selectedArtists = ref<ArtistModel[]>([]);
const shuffledTracks = ref<TrackModel[]>([]);
const currentTrack = ref<TrackModel>();

const isFetching = ref(false);
const isCreatingPlaylist = ref(false);
const showAutocomplete = ref(false);
const isPlaying = ref(false);
const isSuccessful = ref(false);

const getSelectedArtists = computed(() => selectedArtists.value);
const trackCount = ref(10);
const playlistName = ref("");
const artists = computed(() => searchResults.value);
const shuffledTrackUris = computed(() =>
  shuffledTracks.value.map((track) => track.uri)
);

document.addEventListener(
  "play",
  function (e) {
    var audios = document.getElementsByTagName("audio");
    for (var i = 0, len = audios.length; i < len; i++) {
      if (audios[i] != e.target) {
        audios[i].pause();
      }
    }
  },
  true
);

const formatDuration = (duration: number) => {
  return fancyTimeFormat(duration);
};

const searchArtist = async () => {
  if (searchQuery.value === "") {
    showAutocomplete.value = false;
    return;
  }
  if (searchQuery.value.length > 2) {
    showAutocomplete.value = true;
    const { data } = await searchArtists(searchQuery.value);

    const artists = data.artists.items.map((artist: ArtistModel) => ({
      id: artist.id,
      name: artist.name,
      images: artist.images,
    }));
    searchResults.value = artists;
  }
};

const clearErrorMessage = () => {
  setTimeout(() => {
    errorMessage.value = "";
  }, 5000);
};

const setSelectedArtist = (artist: ArtistModel) => {
  if (selectedArtists.value.length === 5) {
    errorMessage.value = "You can only select 5 artists";
    searchQuery.value = "";
    showAutocomplete.value = false;
    clearErrorMessage();
  } else if (selectedArtists.value.find((a) => a.id === artist.id)) {
    errorMessage.value = "Artist already selected.";
    searchQuery.value = "";
    showAutocomplete.value = false;
    clearErrorMessage();
  } else {
    selectedArtists.value = [...selectedArtists.value, artist];
    errorMessage.value = "";
    searchQuery.value = "";
    showAutocomplete.value = false;
  }
};

const removeSelectedArtist = (artist: ArtistModel) => {
  selectedArtists.value = selectedArtists.value.filter(
    (a) => a.id !== artist.id
  );
};

const fetchArtistTopTracks = async (artistId: string) => {
  return getArtistTopTracks(artistId);
};

const createPlaylist = async () => {
  isCreatingPlaylist.value = true;
  try {
    let requestBody = {
      name:
        selectedArtists.value[0].name +
        " + " +
        selectedArtists.value[1].name +
        " and others mix.",
      description: "Created with Mashuppp",
      public: true,
    };
    const { data: playlist } = await createUserPlaylist(
      user.value.id,
      requestBody
    );

    const { id } = playlist;

    let body = {
      uris: shuffledTrackUris.value,
      position: 0,
    };

    const { data } = await addTracksToPlaylist(id, body);

    isCreatingPlaylist.value = false;

    if (data) {
      isSuccessful.value = true;
      clearSuccessMessage();
    }
  } catch (error) {
    isCreatingPlaylist.value = false;
  }
};

const clearSuccessMessage = () => {
  setTimeout(() => {
    isSuccessful.value = false;
  }, 5000);
};

const fetchSeveralArtistsTopTracks = async () => {
  isFetching.value = true;
  const promises = selectedArtists.value.map((artist) =>
    fetchArtistTopTracks(artist.id)
  );
  const results = await Promise.all(promises);
  setTimeout(() => {
    isFetching.value = false;
    const allTracks = results.map((res) => res.data.tracks);

    const mashed = allTracks.reduce((acc, curr) => {
      return [...acc, ...curr];
    }, []);

    console.log({ mashed });

    shuffledTracks.value = getRandom(mashed, trackCount.value);
  }, 3000);
};

const playSound = (track: TrackModel) => {
  const audioEl = document.querySelector(
    "#audio-" + track.id
  ) as HTMLAudioElement;

  currentTrack.value = track;

  if (audioEl) {
    if (audioEl.paused) {
      isPlaying.value = true;
      audioEl.play();
    } else {
      isPlaying.value = false;
      audioEl.pause();
    }
  }
};

getUserProfile();
</script>
<template>
  <div class="h-full w-full">
    <Header />
    <div class="w-full flex flex-col items-center bg-gray-900 pb-14">
      <div
        class="flex flex-col items-center mt-10 pt-2 md:pt-10 space-y-3 mb-5"
      >
        <h1 class="text-green-400 font-semibold text-4xl md:text-7xl">
          Welcome, DJ {{ user.name }}.
        </h1>
        <p class="text-white text-center font-regular text-lg md:text-xl">
          Start by adding your favourite artists for the mashup
        </p>
      </div>

      <div class="flex flex-col w-11/12 md:w-1/2">
        <input
          v-model="searchQuery"
          class="
            border-none
            py-5
            px-5
            w-full
            focus:border-none
            active:border-none
          "
          type="text"
          @keyup="searchArtist"
          placeholder="Search artist by name"
        />
        <div v-if="showAutocomplete" class="bg-red-100 h-28 z-50">
          <ul class="list-style-none">
            <li
              v-for="(artist, index) in artists"
              :key="index"
              class="bg-white hover:bg-green-200 p-3"
              @click="setSelectedArtist(artist)"
            >
              <div class="flex flex-col">
                <div class="flex flex-row items-center">
                  <img
                    :src="artist.images[0]?.url"
                    class="w-10 h-10 rounded-sm"
                    alt="artist"
                  />
                  <div class="flex flex-col ml-4">
                    <h3>{{ artist.name }}</h3>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <p class="text-center mt-10 text-red-400 text-xl">{{ errorMessage }}</p>
    <div
      v-if="getSelectedArtists.length > 0"
      class="mt-4 flex flex-col items-center"
    >
      <p class="text-xl font-bold mb-4">Give me a mix of</p>
      <ul
        class="
          list-style-none
          flex
          justify-center
          flex-wrap
          md:flex-nowrap md:space-x-2
          mb-8
        "
      >
        <li
          class="
            bg-gray-800
            flex
            items-center
            space-x-5
            mt-2
            md:mt-0
            py-3
            px-5
            rounded-full
            mx-1
            md:mx-0
          "
          v-for="(artist, index) in getSelectedArtists"
          :key="index"
        >
          <img
            :src="artist.images[0]?.url"
            class="w-10 h-10 rounded-full"
            alt="artist"
          />
          <p class="text-white">{{ artist.name }}</p>
          <p
            @click="removeSelectedArtist(artist)"
            class="text-lg text-gray-300 cursor-pointer"
          >
            x
          </p>
        </li>
      </ul>

      <div
        v-if="getSelectedArtists.length > 1"
        class="md:w-1/2 flex items-center justify-center space-x-5"
      >
        <select
          class="border-2 border-green-800 w-11/12 md:w-3/6 px-5 py-4"
          v-model="trackCount"
          id="count"
          placeholder="Select total tracks"
        >
          <option v-for="n in getSelectedArtists.length" :value="n * 10">
            {{ n * 10 }} tracks
          </option>
        </select>
        <button
          v-if="!isFetching"
          @click="fetchSeveralArtistsTopTracks"
          class="bg-green-500 hover:bg-green-700 text-white px-10 py-4"
        >
          Mashuppp
        </button>
        <button
          v-else
          disabled
          class="bg-green-500 hover:bg-green-700 text-white px-10 py-4"
        >
          Mashing..
        </button>
      </div>
    </div>

    <div class="px-4 md:px-40 mb-20 w-full">
      <p
        v-if="isSuccessful"
        class="my-10 bg-green-500 p-4 text-white font-bold"
      >
        Playlist has been added to your spotify library.
      </p>

      <!-- Results section -->
      <section
        v-if="shuffledTracks.length > 0 && !isFetching"
        class="mb-20 w-full mt-14"
      >
        <div class="">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <h1 class="md:text-2xl text-xl mb-2 md:mb-0 font-semibold">
              Here's a mashup of selected artists
            </h1>
            <button
              v-if="!isCreatingPlaylist"
              @click="createPlaylist()"
              class="bg-black text-white px-5 md:px-10 py-5"
            >
              Save as Playlist
            </button>
            <button disabled v-else class="bg-gray-600 text-white px-10 py-5">
              Saving...
            </button>
          </div>

          <ul class="border-10 mt-8 border-green-500">
            <table class="track-list w-full table-auto">
              <thead>
                <tr class="text-left">
                  <th class="border-b border-green-500">#</th>
                  <th class="border-b border-green-500">Title</th>
                  <th class="border-b hidden md:table-cell border-green-500">
                    Album
                  </th>
                  <th class="border-b hidden md:table-cell border-green-500">
                    Date Added
                  </th>
                  <th class="border-b hidden md:table-cell border-green-500">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="hover:bg-green-100 group"
                  v-for="(track, index) in shuffledTracks"
                  :key="index"
                  @click="playSound(track)"
                >
                  <td class="">
                    <p class="relative text-sm font-bold">
                      {{ index + 1 }}
                    </p>
                    <img
                      v-if="isPlaying && currentTrack?.id === track.id"
                      class="
                        w-5
                        h-5
                        z-50
                        absolute
                        group-hover:top-5
                        group-hover:left-10
                        group-hover:bg-green-100
                        -mt-6
                        hidden
                        group-hover:block
                      "
                      src="https://img.icons8.com/small/16/000000/pause.png"
                    />
                    <img
                      v-else
                      class="
                        w-5
                        h-5
                        z-50
                        absolute
                        group-hover:top-5
                        group-hover:left-10
                        group-hover:bg-green-100
                        -mt-6
                        hidden
                        group-hover:block
                      "
                      src="https://img.icons8.com/fluency-systems-regular/48/000000/play--v1.png"
                    />
                  </td>
                  <audio class="d-none" :id="'audio-' + track.id">
                    <source :src="track.preview_url" type="audio/mpeg" />
                  </audio>
                  <td class="flex items-center space-x-5">
                    <img
                      :src="track.album?.images?.[0]?.url"
                      class="w-10 h-10 md:w-12 md:h-12 rounded-sm"
                      alt="artist"
                    />
                    <div
                      class="w-9/12 md:w-full flex justify-between items-center"
                    >
                      <div class="w-9/12 md:w-full flex flex-col truncate">
                        <p class="text-sm md:text-lg font-bold truncate">
                          {{ track.name }}
                        </p>
                        <p class="text-sm truncate">
                          {{ track?.artists?.[0].name }}
                        </p>
                      </div>
                      <img
                        v-if="isPlaying && currentTrack?.id === track.id"
                        class="w-3 h-3 md:w-5 md:h-5"
                        src="../assets/audio.gif"
                      />
                    </div>
                  </td>
                  <td class="border-b hidden md:table-cell">
                    <p class="text-sm">{{ track?.album?.name }}</p>
                  </td>
                  <td class="border-b hidden md:table-cell">
                    <p class="text-sm">4 hours ago</p>
                  </td>
                  <td class="border-b hidden md:table-cell">
                    <p class="text-sm">
                      {{ formatDuration(track.duration_ms) }}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </ul>
        </div>
      </section>
      <div class="mt-10 mb-32 flex justify-center" v-if="isFetching">
        <img class="w-80 h-60" src="../assets/loading.gif" />
      </div>
    </div>
  </div>
</template>

<style scoped>
table.track-list td {
  margin: 12px 12px 12px 12px;
  padding: 12px 12px 12px 12px;
  cursor: pointer;
}

table.track-list td::hover {
  background-color: #c5ffd6;
}

table.track-list th {
  margin: 12px 12px 12px 12px;
  padding: 12px 12px 12px 12px;
}

table.track-list {
  /* border-collapse: separate; */
  border-spacing: 10px;
  *border-collapse: expression("separate", cellSpacing= "10px");
}
@media (max-width: 768px) {
  table.track-list th {
    margin: 6px;
    padding: 6px;
  }

  table.track-list td {
    margin: 6px;
    padding: 6px;
    cursor: pointer;
  }
}
</style>
