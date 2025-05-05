import { Router, Request, Response } from 'express';
import { fetchAccessToken } from '../utils/igdb'; 

const gameRoute = Router();

gameRoute.get('/games/:id', async (req: Request, res: any) => {
  const { id } = req.params;

  try {
    const token = await fetchAccessToken();
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `
        fields name, summary, cover.url, genres.name, platforms.name, first_release_date;
        where id = ${id};
      `,
    });

    const data = await response.json();
    const game = data[0];

    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: 'Game not found' });
    }

    res.json({
      success: true,
      game: {
        id: game.id,
        name: game.name,
        summary: game.summary,
        coverUrl: game.cover?.url
          ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}`
          : null,
        genres: game.genres?.map((g: any) => g.name),
        platforms: game.platforms?.map((p: any) => p.name),
        releaseDate: game.first_release_date,
      },
    });
  } catch (err) {
    console.error('Error fetching game from IGDB:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default gameRoute;
