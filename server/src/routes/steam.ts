import express, { Request } from 'express';
import axios from 'axios';
import admin from 'firebase-admin';
import passport from 'passport';
import session from 'express-session';
import SteamStrategy from 'passport-steam';
import { db } from '../firebase/firebase';

const steamRoutes = express.Router();
const STEAM_API_KEY = '3BD5BF4E0C45D545CC8861D6351840E7';

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

passport.use(
  new SteamStrategy(
    {
      returnURL: 'http://localhost:3001/steam/return',
      realm: 'http://localhost:3001/',
      apiKey: STEAM_API_KEY,
    },
    async (identifier, profile, done) => {
      return done(null, profile);
    }
  )
);

steamRoutes.use(
  session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: true,
  })
);
steamRoutes.use(passport.initialize());
steamRoutes.use(passport.session());

/**
 * @swagger
 * /steam/steam:
 *   get:
 *     summary: Initiates Steam authentication and redirects user to Steam login
 *     tags: [Steam]
 *     responses:
 *       302:
 *         description: Redirects to Steam login page
 */

steamRoutes.get('/steam', passport.authenticate('steam'));

/**
 * @swagger
 * /steam/steam/connect/:userId:
 *   get:
 *     summary: Steam OAuth callback that links user's Steam account
 *     tags: [Steam]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the current app user linking their Steam account
 *     responses:
 *       302:
 *         description: Redirects to frontend settings page after linking
 *       404:
 *         description: User not found in Firebase
 *       500:
 *         description: Failed to store Steam account info
 */

steamRoutes.get(
  '/steam/connect/:userId',
  passport.authenticate('steam', { failureRedirect: '/' }),
  async (req: Request, res: any) => {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const steamProfile = req.user as any;
    const steamId = steamProfile.id;
    const displayName = steamProfile.displayName;
    const avatar = steamProfile.photos?.[0]?.value;

    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found!' });
      }

      const existingData = userDoc.data();
      const existingLinked = existingData?.linkedAccounts || [];

      const updatedLinked = existingLinked.includes('steam')
        ? existingLinked
        : [...existingLinked, 'steam'];

      await userRef.set(
        {
          steam: {
            steamId,
            displayName,
            avatar,
            connectedAt: new Date(),
          },
          steamId,
          linkedAccounts: updatedLinked,
        },
        { merge: true }
      );

      res.redirect(`http://localhost:5173/settings?linked=steam`);
    } catch (err) {
      console.error('Steam connect failed:', err);
      res.status(500).json({ error: 'Failed to link Steam account' });
    }
  }
);

/**
 * @swagger
 * /steam/games/{steamId}:
 *   get:
 *     summary: Get list of owned games and playtime for a Steam user
 *     tags: [Steam]
 *     parameters:
 *       - in: path
 *         name: steamId
 *         required: true
 *         schema:
 *           type: string
 *         description: SteamID64 of the user
 *     responses:
 *       200:
 *         description: Successfully fetched owned games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 games:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       appid:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       playtime_forever:
 *                         type: integer
 *       500:
 *         description: Failed to fetch games
 */

steamRoutes.get('/games/:steamId', async (req: Request, res: any) => {
  const { steamId } = req.params;

  try {
    const response = await axios.get(
      'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/',
      {
        params: {
          key: STEAM_API_KEY,
          steamid: steamId,
          include_appinfo: true,
          include_played_free_games: true,
        },
      }
    );

    const games = response.data.response.games || [];
    res.json({ games });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch owned games' });
  }
});

/**
 * @swagger
 * /steam/achievements/{steamId}/{appId}:
 *   get:
 *     summary: Get achievement data for a specific game for a Steam user
 *     tags: [Steam]
 *     parameters:
 *       - in: path
 *         name: steamId
 *         required: true
 *         schema:
 *           type: string
 *         description: SteamID64 of the user
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: AppID of the game (e.g. 730 for CS:GO)
 *     responses:
 *       200:
 *         description: Successfully fetched achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Failed to fetch achievements
 */

steamRoutes.get('/achievements/:steamId/:appId', async (req, res) => {
  const { steamId, appId } = req.params;

  try {
    const response = await axios.get(
      'https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/',
      {
        params: {
          key: STEAM_API_KEY,
          steamid: steamId,
          appid: appId,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

export default steamRoutes;
