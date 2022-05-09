export type ITrack = {
  id: string;
  artists: Array<{
    name: string;
    url: string;
  }>;
  image: string;
  url: string;
  previewUrl: string;
  title: string;
  album: string;
};
