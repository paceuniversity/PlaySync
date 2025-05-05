import express, { Request } from 'express';
import axios from 'axios';
import { db } from '../firebase/firebase';
import admin from 'firebase-admin';

const riotRoutes = express.Router();
const RIOT_API_KEY = 'RGAPI-add7439a-c137-485a-b3c9-9aae69edc2f3';

/**
 * @swagger
 * /riot/connect:
 *   post:
 *     summary: Connect a Riot account to a user profile
 *     tags: [Riot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - username
 *               - tag
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the current app user
 *               username:
 *                 type: string
 *                 description: The Riot Games username
 *               tag:
 *                 type: string
 *                 description: The Riot tagline
 *     responses:
 *       200:
 *         description: Riot account successfully connected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 puuid:
 *                   type: string
 *                 username:
 *                   type: string
 *                 tag:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to link Riot account
 */

riotRoutes.post('/connect', async (req: Request, res: any) => {
  const { userId, username, tag } = req.body;

  if (!userId || !username || !tag) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await axios.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );

    const { puuid, gameName, tagLine } = response.data;

    await db
      .collection('users')
      .doc(userId)
      .set(
        {
          riot: {
            puuid,
            username: gameName,
            tagline: tagLine,
            connectedAt: new Date(),
          },
          riotId: puuid,
          linkedAccounts: admin.firestore.FieldValue.arrayUnion('riot'),
        },
        { merge: true }
      );

    res.json({ success: true, puuid, username: gameName, tag: tagLine });
  } catch (error: any) {
    console.error('❌ Riot API Connection Error');
    console.error(
      '➡️ Request URL:',
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}`
    );
    console.error('➡️ Request Headers:', { 'X-Riot-Token': RIOT_API_KEY });
    console.error('➡️ Request Params:', { userId, username, tag });

    if (error.response) {
      console.error('⚠️ Riot API responded with error:');
      console.error('➡️ Status:', error.response.status);
      console.error('➡️ Data:', error.response.data);

      return res.status(error.response.status).json({
        error: 'Riot API Error',
        message: error.response.data?.status?.message || 'Unknown error',
      });
    } else if (error.request) {
      console.error('⚠️ No response received from Riot API.');
      return res.status(500).json({ error: 'No response from Riot API' });
    } else {
      console.error('⚠️ Error setting up Riot API request:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /riot/matches/{puuid}:
 *   get:
 *     summary: Fetch recent match history for a Riot user
 *     tags: [Riot]
 *     parameters:
 *       - in: path
 *         name: puuid
 *         required: true
 *         schema:
 *           type: string
 *         description: Riot PUUID of the user (globally unique Riot player ID)
 *     responses:
 *       200:
 *         description: Successfully retrieved match data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Failed to fetch matches
 */

riotRoutes.get('/matches/:puuid', async (req, res) => {
  const { puuid } = req.params;

  try {
    const matchIdsResponse = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY },
        params: { start: 0, count: 10 },
      }
    );

    const matchIds = matchIdsResponse.data;

    const matchDetails = await Promise.all(
      matchIds.map((id: string) =>
        axios.get(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${id}`,
          {
            headers: { 'X-Riot-Token': RIOT_API_KEY },
          }
        )
      )
    );

    res.json({ matches: matchDetails.map((m) => m.data) });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

export default riotRoutes;
