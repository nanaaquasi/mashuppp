import { AddTrackRequestModel, PlaylistRequestModel } from "../model";
import { receive, dispatch } from "./index";

let scope =
  "user-read-private user-read-email playlist-modify-private playlist-modify-public playlist-read-private playlist-read-collaborative";
let client_id = import.meta.env.VITE_APP_CLIENT_ID as string;
let redirect_uri = import.meta.env.VITE_APP_REDIRECT_URL as string;

let authUrl = import.meta.env.VITE_APP_AUTH_URL;
authUrl += "?response_type=token";
authUrl += "&client_id=" + encodeURIComponent(client_id);
authUrl += "&scope=" + encodeURIComponent(scope);
authUrl += "&redirect_uri=" + encodeURIComponent(redirect_uri);

const getCurrentUserProfile = () => receive("/me");

const searchArtists = (query: string) =>
  receive(`/search?q=${query}&type=artist&limit=5`);

const getArtistTopTracks = (artistId: string) =>
  receive(`/artists/${artistId}/top-tracks?country=US&limit=5`);

const createUserPlaylist = (
  userId: string,
  requestBody: PlaylistRequestModel
) => {
  return dispatch(requestBody, `/users/${userId}/playlists`);
};

const addTracksToPlaylist = (
  playlistId: string,
  requestBody: AddTrackRequestModel
) => {
  return dispatch(requestBody, `/playlists/${playlistId}/tracks`);
};

export const spotify = {
  authUrl,
  getCurrentUserProfile,
  searchArtists,
  getArtistTopTracks,
  createUserPlaylist,
  addTracksToPlaylist,
};
