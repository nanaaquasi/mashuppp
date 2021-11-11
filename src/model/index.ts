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
  images?: Image[];
};

export interface UserModel {
  id: string;
  name: string;
  profileImage: string;
}

export interface ArtistModel {
  id: string;
  name: string;
  images: [Image];
}

export interface TrackModel {
  id?: string;
  name?: string;
  popularity?: number;
  preview_url?: string;
  duration_ms: number;
  artists?: Artist[];
  album?: Album;
  uri: string;
}

export interface PlaylistRequestModel {
  name: string;
  description: string;
  public: boolean;
}

export interface AddTrackRequestModel {
  uris: string[];
  position: number;
}
