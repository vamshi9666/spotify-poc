import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { IoMdPause, IoMdPlayCircle, IoMdSearch } from "react-icons/io";
import { useDebounce } from "usehooks-ts";
import { ITrack } from "../lib/types/spotify";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = React.useState("");

  const [selectedTrack, setSelectedTrack] = React.useState<ITrack | null>(null);

  const query = useDebounce(inputValue, 500);

  const [tracks, setTracks] = useState<ITrack[]>([]);

  useEffect(() => {
    async function fetchTracks() {
      try {
        setLoading(true);
        const response = await fetch("/api/search-spotify?q=" + query);
        const data = await response.json();

        setTracks(data?.data?.tracks?.items);
        console.log("data in fetchTracks", data);
      } catch (error) {
        console.log("error in fetchTracks", error);
      } finally {
        setLoading(false);
      }
    }
    if (query?.length > 0) {
      startTransition(() => {
        fetchTracks();
      });
    }
  }, [query]);

  const onTrackTPlay = useCallback(
    async (track: ITrack) => {
      if (selectedTrack) {
        setSelectedTrack(null);
        return;
      }

      if (track.previewUrl) {
        setSelectedTrack(track);
      } else {
        const previewUrl = await fetch(
          `/api/get-preview-url?id=${track.id}`
        ).then((res) => res.json());
        console.log("previewUrl", previewUrl);
        setSelectedTrack({
          ...track,
          previewUrl: previewUrl.data.previewUrl,
        });
      }
    },
    [selectedTrack]
  );

  const tracksList = useMemo(() => {
    return tracks.map((track) => {
      const isPlaying = track.id === selectedTrack?.id;
      return (
        <TrackItem
          {...track}
          key={track.url}
          {...{ isPlaying }}
          onTogglePlay={() => {
            onTrackTPlay(track);
          }}
        />
      );
    });
  }, [tracks, onTrackTPlay, selectedTrack]);

  return (
    <div className={"flex flex-col items-center"}>
      <Head>
        <title>Spotify POC</title>
        <meta name="description" content="Spotify POC " />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={" container py-6  px-8  w-full max-w-5xl"}>
        <h1 className={"  my-5 text-2xl font-medium  "}>Spotify player</h1>

        <div className="w-full mb-4  ">
          <div className="relative flex items-center w-full h-12  focus-within:shadow-lg bg-white overflow-hidden border border-black rounded-full ">
            <input
              className="peer h-full w-full outline-none  text-gray-700 pl-4 text-xl"
              type="text"
              placeholder="Search something.."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="grid place-items-center h-full w-12 text-gray-700 text-2xl ">
              <IoMdSearch />
            </div>
          </div>
        </div>

        <ul className={"list-none"}>{tracksList}</ul>
        {selectedTrack && <Player uri={selectedTrack.previewUrl} />}
      </main>
    </div>
  );
};

const IMAGE_SIZE = 120;
const TrackItem = (
  props: ITrack & {
    onTogglePlay: () => void;
    isPlaying: boolean;
  }
) => {
  const {
    title,
    image,
    artists,
    album,
    previewUrl,
    url,
    onTogglePlay,
    isPlaying,
  } = props;
  return (
    <li className={"flex  p-3 border border-gray-400 rounded-xl mb-3 "}>
      <Image
        className={"rounded-xl "}
        src={image}
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
      />
      <div className={"ml-2 flex flex-col "}>
        <h2 className={"text-xl font-medium "}>{title}</h2>
        <p className={"text-md text-gray-500 font-light"}>
          {artists
            .map((artist) => {
              return artist.name;
            })
            .join(", ")}
        </p>
        <button className="mt-auto text-4xl " onClick={() => onTogglePlay()}>
          {
            isPlaying ? <IoMdPause /> : <IoMdPlayCircle />
            // <IoMdPlayCircle />
          }
        </button>
      </div>
    </li>
  );
};

const Player: React.FC<{ uri: string }> = ({ uri }) => {
  useEffect(() => {
    const audio = new Audio(uri);
    audio.play();

    return () => {
      audio.pause();
    };
  }, [uri]);
  return null;
};

export default Home;
