import { AddTrackRequestModel, PlaylistRequestModel } from "../model";
import { receive, dispatch } from "./index";

export const getCurrentUserProfile = () => receive("/me");

export const searchArtists = (query: string) =>
  receive(`/search?q=${query}&type=artist&limit=5`);

export const getArtistTopTracks = (artistId: string) =>
  receive(`/artists/${artistId}/top-tracks?country=US&limit=5`);

export const createUserPlaylist = (
  userId: string,
  requestBody: PlaylistRequestModel
) => {
  return dispatch(requestBody, `/users/${userId}/playlists`);
};

export const addTracksToPlaylist = (
  playlistId: string,
  requestBody: AddTrackRequestModel
) => {
  return dispatch(requestBody, `/playlists/${playlistId}/tracks`);
};
