import express, { RequestHandler } from "express";
import { fetchAccessToken } from '../utils/igdb';

const popularGamesRouter = express.Router();



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
  //handler required i can barely keep track of why
  try {
    const token = await fetchAccessToken();

    const categories = [];

    for (const [type, label] of Object.entries(POPULARITY_MAP)) {
      await delay(200); 
    
      try {
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
        if (gameIds.length === 0) {
          categories.push({ label, games: [] });
          continue;
        }
    
        await delay(200);
    
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
        const games = gamesData.map((g: any) => ({
          id: g.id,
          name: g.name,
          coverUrl: g.cover?.url
            ? `https:${g.cover.url.replace("t_thumb", "t_cover_big")}`
            : null,
        }));
    
        categories.push({ label, games });
      } catch (err) {
        console.error(`error fetching type ${type}:`, err);
        categories.push({ label, games: [] });
      }
    }
    

    res.json({ categories });
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).json({ error: "Failed to fetch game data" });
  }
};
popularGamesRouter.get('/', popularGamesHandler);

export default popularGamesRouter;
