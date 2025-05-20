import express, { Request } from 'express';
import axios from 'axios';
import admin from 'firebase-admin';
import passport from 'passport';
import session from 'express-session';
import SteamStrategy from 'passport-steam';
import { db } from '../firebase/firebase';

interface SteamProfile {
  id: string;
  displayName: string;
  photos: { value: string }[];
}

const steamRoutes = express.Router();
const STEAM_API_KEY = 'STEAM API';
const SESSION_SECRET = 'STEAM SECRET';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

interface ExtendedSteamProfile extends SteamProfile {
  sessionUserId?: string;
}

passport.serializeUser((user: any, done) => {
  done(null, { ...user, sessionUserId: (user as any).sessionUserId });
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

passport.use(
  new SteamStrategy(
    {
      returnURL: 'http://localhost:3000/api/steam/return',
      realm: 'http://localhost:3000/',
      apiKey: STEAM_API_KEY,
      passReqToCallback: true,
    },
    async (req, identifier, profile: ExtendedSteamProfile, done) => {
      profile.sessionUserId = (req.session as any).userId;
      return done(null, profile);
    }
  )
);

steamRoutes.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
    },
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

steamRoutes.get(
  '/steam',
  (req: Request, res: any, next) => {
    const userId = Array.isArray(req.query.userId)
      ? req.query.userId[0]
      : req.query.userId;

    if (typeof userId !== 'string' || !userId.trim()) {
      return res.status(400).send('Invalid or missing userId');
    }

    req.session.userId = userId;
    console.log('Session set:', req.session);
    next();
  },
  passport.authenticate('steam')
);

steamRoutes.get(
  '/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  async (req: Request, res: any) => {
    console.log('Session on return:', req.session);
    console.log('User ID in session:', req.session.userId);

    const steamProfile = req.user as ExtendedSteamProfile;

    const userId = steamProfile.sessionUserId || req.session.userId;

    if (!userId) {
      return res.status(400).json({ error: 'Missing session userId' });
    }

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
            connectedAt: admin.firestore.Timestamp.now(),
          },
          steamId,
          linkedAccounts: updatedLinked,
        },
        { merge: true }
      );

      return res.redirect(
        'http://localhost:5173/profile-settings?linked=steam'
      );
    } catch (err) {
      console.error('Steam connect failed:', err);
      return res.status(500).json({ error: 'Failed to link Steam account' });
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
    console.log('[STEAM ROUTE] Steam ID:', steamId);
    console.log('[STEAM ROUTE] Using API key:', STEAM_API_KEY);

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
    console.error(
      '[STEAM ROUTE] Error from Steam:',
      (error as any)?.response?.data
    );
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
