import { Router } from 'express';
import { db } from '../firebase/firebase';  

const router = Router();

router.get('/popular-games', async (req, res) => {
  try {
    const snapshot = await db.collection('popularGames').get();
    const categories = snapshot.docs.map(doc => doc.data());
    res.json({ categories });
  } catch (err) {
    console.error('Failed to fetch games:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;