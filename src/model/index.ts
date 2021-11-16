type Image = {
  height?: string | number;
  width?: string | number;
  url?: string;
};

type Artist = {
  id?: string;
  name?: string;
  uri?: string;
};

type Album = {
  href?: string;
  name?: string;
  cover?: string;
  images?: Image[];
  title?: string;
};

type DeezerAlbum = {
  name?: string;
  cover?: string;
  title?: string;
};

export interface UserModel {
  id: string;
  name: string;
  profileImage: string;
}

export interface ArtistModel {
  id: string;
  name: string;
  image: string;
  tracklistUrl?: string;
}

export interface TrackModel {
  id?: string;
  name?: string;
  preview_url?: string;
  cover: string;
  duration_ms: number;

  artist?: Artist;
  album?: Album | DeezerAlbum;
  uri: string;
}

export interface TrackResponseModel {
  id?: string;
  name?: string;
  title?: string;
  preview_url?: string;
  preview?: string;
  duration_ms: number;
  duration?: number;
  artist?: Artist;
  artists?: Artist[];
  album?: Album;
  albums?: Album[];
  uri: string;
}

export interface PlaylistRequestModel {
  name?: string;
  title?: string;
  description?: string;
  public?: boolean;
}

export interface AddTrackRequestModel {
  uris?: string[];
  ids?: string;
  position?: number;
}
