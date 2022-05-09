import { NextApiHandler } from "next";
import { JSDOM } from "jsdom";

const getPreviewUrl: NextApiHandler = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: "id is required" });
    return;
  }
  //   const token = await getToken();

  //   const response = await fetch(
  //     `https://api.spotify.com/v1/tracks/${id}?market=AD`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );

  const response = await fetch(`https://open.spotify.com/embed/track/${id}`);

  const text = await response.text();
  const dom = new JSDOM(text, {
    includeNodeLocations: true,
  });

  const document = dom.window.document;

  const resource = document.querySelector("#resource")?.innerHTML;

  //   console

  const resourceJson = JSON.parse(decodeURIComponent(resource || ""));

  console.log("text", resourceJson);

  //   const browser = await puppeteer.launch({
  //     headless: true,
  //   });
  //   const page = await browser.newPage();
  //   await page.goto();

  //   const previewUrl = await page.evaluate(() => {
  //     const previewUrl = document.querySelector("#resource")?.innerHTML;

  //     return previewUrl;
  //   });

  //   await browser.close();
  res.status(200).json({
    success: true,
    message: "success",
    data: {
      previewUrl: resourceJson?.preview_url || "",
      //   available_markets: text.available_markets,
    },
  });
};

export default getPreviewUrl;
