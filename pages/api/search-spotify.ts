// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import { ITrack } from "../lib/types/spotify";

type Data = {
  success: boolean;
  message: string;
  data?: {
    tracks: {
      items: Array<ITrack>;
    };
  };
};

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

console.log("client_id", client_id);
console.log("client_secret", client_secret);

export const getToken = async () => {
  const parmas = new URLSearchParams();
  parmas.append("grant_type", "client_credentials");
  const req = await fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${client_id}:${client_secret}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: parmas,
  });
  const data = await req.json();

  return data.access_token;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { query } = req;

    const { q = "", limit = 10, token = "" } = query;

    if (q?.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No query provided",
      });
    }

    const authToken = await getToken();

    const r = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=track&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    const data = await r.json();

    console.log("authToken", data);

    const items: ITrack[] = data?.tracks?.items?.map((item: any) => {
      return {
        id: item.id,
        image: item?.album?.images[0]?.url || "",
        previewUrl: item?.preview_url || "",
        title: item?.name || "",
        url: item?.uri || "",
        album: item?.album?.name || "",
        artists: item.artists.map((artist: any) => {
          return {
            name: artist.name,
            url: artist.uri,
          };
        }),
      } as ITrack;
    });

    res.status(200).json({
      success: true,
      message: "success",
      data: {
        tracks: {
          items,
        },
      },
    });
  } catch (error) {
    console.log("error in search-spotify", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
