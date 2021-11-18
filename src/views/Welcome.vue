<script lang="ts" setup>
import { actions, getters } from "../store";
import Header from "../components/Header.vue";
import { computed, ref } from "@vue/reactivity";
import { spotify } from "../apis/spotify.service";
import { ArtistModel, TrackModel, TrackResponseModel } from "../model";
import { getRandom, fancyTimeFormat } from "../utils";
import { deezer } from "../apis/deezer.service";

const { getUserProfile } = actions;
const { user } = getters;
const channel = localStorage.getItem("channel");

const token = localStorage.getItem(channel + "_access_token");

if (!token) {
  window.location.href = "/";
}

getUserProfile();

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
const isError = ref(false);
const getSelectedArtists = computed(() => selectedArtists.value);
const trackCount = ref(10);
const playlistName = ref("");
const artists = computed(() => searchResults.value);
const shuffledTrackUris = computed(() =>
  shuffledTracks.value.map((track) => track?.uri)
);
const shuffledTrackIds = computed(() =>
  shuffledTracks.value.map((track) => track?.id).join(",")
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

    switch (channel) {
      case "SPOTIFY":
        const { data } = await spotify.searchArtists(searchQuery.value);

        const artists = data.artists.items.map(
          (artist: any): ArtistModel => ({
            id: artist.id,
            name: artist.name,
            image: artist.images[0].url,
          })
        );
        searchResults.value = artists;
        break;
      case "DEEZER":
        const { data: deezerRes } = await deezer.searchArtists(
          searchQuery.value
        );

        console.log("res", deezerRes);

        const res = deezerRes.data.map(
          (artist: any): ArtistModel => ({
            id: artist.id,
            name: artist.name,
            image: artist.picture,
            tracklistUrl: artist.tracklist,
          })
        );
        searchResults.value = res;
        break;
      default:
        break;
    }
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
  switch (channel) {
    case "DEEZER":
      return deezer.getArtistTopTracks(artistId);
    case "SPOTIFY":
      return spotify.getArtistTopTracks(artistId);
    default:
      break;
  }
};

const createSpotifyPlaylist = async () => {
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
    const { data: playlist } = await spotify.createUserPlaylist(
      user.value.id,
      requestBody
    );

    const { id } = playlist;

    let body = {
      uris: shuffledTrackUris.value,
      position: 0,
    };

    const { data } = await spotify.addTracksToPlaylist(id, body);

    isCreatingPlaylist.value = false;

    if (data) {
      isSuccessful.value = true;
      clearSuccessMessage();
    }
  } catch (error) {
    isCreatingPlaylist.value = false;
  }
};

const createDeezerPlaylist = async () => {
  isCreatingPlaylist.value = true;
  try {
    let requestBody = {
      title:
        selectedArtists.value[0].name +
        " + " +
        selectedArtists.value[1].name +
        " and others mix. Created with Mashuppp",
    };
    const { data: playlist } = await deezer.createUserPlaylist(
      user.value.id,
      requestBody
    );

    const { id } = playlist;

    let body = {
      ids: shuffledTrackIds.value,
    };

    const { data } = await deezer.addTracksToPlaylist(id, body);

    isCreatingPlaylist.value = false;

    if (data.error) {
      isError.value = true;
      clearSuccessMessage();
      return;
    }

    if (data) {
      isSuccessful.value = true;
      clearSuccessMessage();
    }
  } catch (error) {
    isCreatingPlaylist.value = false;
  }
};

const createPlaylist = () => {
  switch (channel) {
    case "SPOTIFY":
      createSpotifyPlaylist();
      break;
    case "DEEZER":
      createDeezerPlaylist();
      break;
    default:
      break;
  }
};

const clearSuccessMessage = () => {
  setTimeout(() => {
    isSuccessful.value = false;
    isError.value = false;
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

    switch (channel) {
      case "SPOTIFY":
        const allTracks = results.map((res) => res?.data.tracks);

        const mashed = allTracks.reduce((acc, curr) => {
          return [...acc, ...curr];
        }, []);

        const mixedTracks: TrackModel[] = mashed.map(
          (track: TrackResponseModel) => {
            return {
              id: track.id,
              name: track.name,
              preview_url: track.preview_url,
              artist: track.artists?.[0],
              album: track?.album,
              cover: track.album?.images?.[0].url,
              duration_ms: track.duration_ms,
              uri: track.uri,
            };
          }
        );

        shuffledTracks.value = getRandom(mixedTracks, trackCount.value);
        break;

      case "DEEZER":
        const tracks = results.map((res) => res?.data.data);
        const trackMix = tracks.reduce((acc, curr) => {
          return [...acc, ...curr];
        }, []);

        const mashedTracks: TrackModel[] = trackMix.map(
          (track: TrackResponseModel) => {
            return {
              id: track.id,
              name: track.title,
              preview_url: track.preview,
              artist: track.artist,
              album: track.album,
              cover: track.album?.cover,
              duration_ms: track?.duration && track?.duration * 1000,
            };
          }
        );

        shuffledTracks.value = getRandom(mashedTracks, trackCount.value);
        break;

      default:
        break;
    }
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
</script>
<template>
  <div class="h-full w-screen md:w-full overflow-hidden md:overflow-scroll">
    <Header />
    <div class="w-full flex flex-col items-center bg-gray-900 pb-14">
      <div
        class="flex flex-col items-center mt-10 pt-2 md:pt-10 space-y-3 mb-5"
      >
        <h1
          class="
            text-transparent
            bg-clip-text bg-gradient-to-br
            from-green-200
            to-green-500
            font-semibold
            text-4xl
            md:text-7xl
          "
        >
          Welcome, DJ {{ user.name?.split(" ")[0] || "" }}.
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
        <div v-if="showAutocomplete" class="bg-red-100 z-50">
          <ul class="list-style-none">
            <li
              v-if="artists.length > 0"
              v-for="(artist, index) in artists"
              :key="index"
              class="bg-white hover:bg-green-200 p-3"
              @click="setSelectedArtist(artist)"
            >
              <div class="flex flex-col">
                <div class="flex flex-row items-center">
                  <img
                    :src="artist.image"
                    class="w-10 h-10 rounded-sm"
                    alt="artist"
                  />
                  <div class="flex flex-col ml-4">
                    <h3>{{ artist.name }}</h3>
                  </div>
                </div>
              </div>
            </li>
            <li v-else class="bg-white hover:bg-green-200 p-3">
              No artist found
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
            :src="artist.image"
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
          class="border-2 border-green-800 bg-white w-11/12 md:w-3/6 px-5 py-4"
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

    <div
      v-else
      class="
        px-4
        md:px-32
        flex flex-col
        items-center
        justify-between
        mx-auto
        text-center
      "
    >
      <h2 class="text-3xl mb-6 font-semibold">Create your mix</h2>
      <div
        class="
          md:px-24
          flex flex-col
          md:flex-row
          items-center
          justify-between
          mx-auto
          md:w-11/12
          w-full
          text-center
          space-y-4
          md:space-y-0
        "
      >
        <div class="flex flex-col w-11/12 md:w-4/12 items-center">
          <img
            class="w-24 h-24 md:w-32 md:h-32 filter grayscale"
            src="https://img.icons8.com/ios-glyphs/90/26e07f/1.png"
          />
          <p class="w-11/12">
            Search and add up to 5 of your favourite artists.
          </p>
        </div>
        <div class="w-11/12 md:w-4/12 flex flex-col items-center">
          <img
            class="w-24 h-24 md:w-32 md:h-32 filter grayscale"
            src="https://img.icons8.com/ios-glyphs/90/26e07f/2.png"
          />
          <p class="w-11/12">
            A mashup of top songs from each artist is generated.
          </p>
        </div>
        <div class="w-11/12 md:w-4/12 flex flex-col items-center">
          <img
            class="w-24 h-24 md:w-32 md:h-32 filter grayscale"
            src="https://img.icons8.com/ios-glyphs/90/26e07f/3.png"
          />
          <p class="w-11/12">Save the mashup to your playlist of choice.</p>
        </div>
      </div>
    </div>

    <div class="px-4 md:px-32 mb-20 w-full">
      <p
        v-if="isSuccessful"
        class="my-10 bg-green-500 p-4 text-white font-bold"
      >
        Playlist has been added to your {{ channel?.toLowerCase() }} library.
      </p>
      <p v-if="isError" class="my-10 bg-red-400 p-4 text-white font-bold">
        Something went wrong adding playlist to your
        {{ channel?.toLowerCase() }} library. Please try again
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

          <ul
            class="
              border-10
              w-screen
              md:w-full
              overflow-hidden
              mt-8
              border-green-500
            "
          >
            <table class="track-list w-full table-auto">
              <thead>
                <tr class="text-left">
                  <th class="border-b border-green-500">#</th>
                  <th class="border-b border-green-500">Title</th>
                  <th class="border-b hidden md:table-cell border-green-500">
                    Album
                  </th>
                  <!-- <th class="border-b hidden md:table-cell border-green-500">
                    Date Added
                  </th> -->
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
                      :src="track?.cover"
                      class="w-12 h-12 md:w-12 md:h-12 rounded-sm"
                      alt="artist"
                    />
                    <div
                      class="
                        w-11/12
                        md:w-6/12
                        flex
                        justify-between
                        items-center
                      "
                    >
                      <div class="w-9/12 md:w-9/12 flex flex-col truncate">
                        <p class="text-sm md:text-sm font-bold truncate">
                          {{ track.name }}
                        </p>
                        <p class="text-sm truncate">
                          {{ track?.artist?.name }}
                        </p>
                      </div>
                      <img
                        v-if="isPlaying && currentTrack?.id === track.id"
                        class="w-3 h-3 md:w-5 md:h-5"
                        src="../assets/audio.gif"
                      />
                    </div>
                  </td>
                  <td class="hidden md:table-cell">
                    <p class="text-sm">
                      {{ track?.album?.name || track?.album?.title }}
                    </p>
                  </td>
                  <!-- <td class="border-b hidden md:table-cell">
                    <p class="text-sm">4 hours ago</p>
                  </td> -->
                  <td class="hidden md:table-cell">
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
        <img class="w-60 h-40 md:w-80 md:h-60" src="../assets/loading.gif" />
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
