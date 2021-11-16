// import { AddTrackRequestModel, PlaylistRequestModel } from "../model";
import { AddTrackRequestModel, PlaylistRequestModel } from "../model";
import { receive, dispatch } from "./deezer.api";

let perms = "manage_library,basic_access,email";
let appId = import.meta.env.VITE_APP_DEEZER_APPID as string;
let redirectURI = import.meta.env.VITE_APP_REDIRECT_URL as string;
const token = localStorage.getItem("DEEZER_access_token");

let authUrl = import.meta.env.VITE_APP_DEEZER_AUTH_URL;
authUrl += "?response_type=token";
authUrl += "&app_id=" + encodeURIComponent(appId);
authUrl += "&perms=" + perms;
authUrl += "&redirect_uri=" + encodeURIComponent(redirectURI);

export const getCurrentUserProfile = () =>
  receive("/user/me?access_token=" + token);

export const searchArtists = (query: string) =>
  receive(`/search/artist?q=${query}&limit=5`);

export const getArtistTopTracks = (artistId: string) =>
  receive(`/artist/${artistId}/top?limit=10`);

export const createUserPlaylist = (
  userId: string,
  requestBody: PlaylistRequestModel
) => {
  return dispatch(
    "",
    `/user/${userId}/playlists?access_token=${token}&title=${requestBody.title}`
  );
};

export const addTracksToPlaylist = (
  playlistId: string,
  requestBody: AddTrackRequestModel
) => {
  return dispatch(
    requestBody,
    `/playlist/${playlistId}/tracks?songs=${requestBody.ids}`
  );
};

export const deezer = {
  authUrl,
  getCurrentUserProfile,
  searchArtists,
  getArtistTopTracks,
  createUserPlaylist,
  addTracksToPlaylist,
};
