import express, { RequestHandler } from "express";

const popularGamesRouter = express.Router();

let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function fetchAccessToken(): Promise<string> {
  const now = Date.now();
  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  const client_id = process.env.CLIENT_ID!;
  const client_secret = process.env.CLIENT_SECRET!;
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?` +
      `client_id=${client_id}&client_secret=${client_secret}` +
      `&grant_type=client_credentials`,
    { method: "POST" }
  );
  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000 - 60 * 1000;
  return accessToken!;
}

const POPULARITY_MAP: Record<number, string> = {
  1: "IGDB Visits",
  2: "IGDB Want to Play",
  3: "IGDB Playing",
  4: "IGDB Played",
  5: "Steam 24hr Peak Players",
  6: "Steam Positive Reviews",
  7: "Steam Negative Reviews",
  8: "Steam Total Reviews",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const popularGamesHandler: RequestHandler = async (req, res) => {
  try {
    const token = await fetchAccessToken();
    const categories = [];

    for (const [type, label] of Object.entries(POPULARITY_MAP)) {
      await delay(300); // wait 300ms to avoid rate limiting

      const popRes = await fetch("https://api.igdb.com/v4/popularity_primitives", {
        method: "POST",
        headers: {
          "Client-ID": process.env.CLIENT_ID!,
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: `
          fields game_id;
          sort value desc;
          limit 10;
          where popularity_type = ${type};
        `,
      });

      if (!popRes.ok) {
        console.error(`popularity_primitives error for type ${type}:`, popRes.statusText);
        categories.push({ label, games: [] });
        continue;
      }

      const popData = await popRes.json();
      const gameIds = popData.map((p: any) => p.game_id);
      if (!Array.isArray(popData) || gameIds.length === 0) {
        categories.push({ label, games: [] });
        continue;
      }

      const gamesRes = await fetch("https://api.igdb.com/v4/games", {
        method: "POST",
        headers: {
          "Client-ID": process.env.CLIENT_ID!,
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body: `
          fields name, cover.url;
          where id = (${gameIds.join(",")});
        `,
      });

      if (!gamesRes.ok) {
        console.error(`games API error for type ${type}:`, gamesRes.statusText);
        categories.push({ label, games: [] });
        continue;
      }

      const gamesData = await gamesRes.json();
      if (!Array.isArray(gamesData)) {
        categories.push({ label, games: [] });
        continue;
      }

      const games = gamesData.map((g: any) => ({
        name: g.name,
        coverUrl: g.cover?.url
          ? `https:${g.cover.url.replace("t_thumb", "t_cover_big")}`
          : null,
      }));

      categories.push({ label, games });
    }

    res.json({ categories });
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({ error: "Failed to fetch game data" });
  }
};
popularGamesRouter.use(popularGamesHandler);

export default popularGamesRouter;
