import { Router } from 'express';
import { db } from '../firebase/firebase';

const router = Router();

router.get('/games/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const snapshot = await db
      .collection('popularGames')
      .where('games', 'array-contains-any', [{ name }])
      .get();

    let foundGame = null;

    snapshot.forEach(doc => {
      const category = doc.data();
      const gameMatch = category.games.find((g: any) => g.name === name);
      if (gameMatch) foundGame = gameMatch;
    });

    if (foundGame) {
      res.json({ success: true, game: foundGame });
    } else {
      res.status(404).json({ success: false, message: 'Game not found' });
    }
  } catch (err) {
    console.error('Error fetching game details:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;