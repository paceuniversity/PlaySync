import express, { Request } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../firebase/firebase';
import admin from 'firebase-admin';
import { IUser } from '../schemas/user.schema';

const authRoutes = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already in use or invalid input
 *       500:
 *         description: Registration failed
 */

authRoutes.post('/signup', async (req: Request, res: any) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const userSnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 7 characters and include one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const lowercaseUsername = username.toLowerCase();

    const newUser: IUser = {
      firstName,
      lastName,
      username: lowercaseUsername,
      email,
      password: hashedPassword,
      bio: '',
      profilePictureUrl: '',
      steamId: '',
      xboxId: '',
      riotId: '',
      twitchId: '',
      youtubeId: '',
      linkedAccounts: [],
      gameLibrary: [],
      friendsList: [],
      numOfFriends: 0,
      numOfCommunities: 0,
      numOfGames: 0,
      joinedCommunities: [],
      onlineStatus: 'offline',
      lastActive: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
    };

    const userRef = await db.collection('users').add(newUser);

    return res.status(201).json({
      message: 'User registered successfully!',
      userId: userRef.id,
      username,
      email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed!' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with email or username
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userReq
 *               - password
 *             properties:
 *               userReq:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing fields or invalid password format
 *       401:
 *         description: Incorrect password
 *       404:
 *         description: User not found
 *       500:
 *         description: Login failed
 */

authRoutes.post('/login', async (req: Request, res: any) => {
  try {
    // userReq can be email or username
    const { userReq, password } = req.body;

    if (!userReq || !password) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Invalid password!',
      });
    }

    let userSnapshot = await db
      .collection('users')
      .where('email', '==', userReq)
      .get();

    if (userSnapshot.empty) {
      // Try username instead
      const lowercaseUsername = userReq.toLowerCase();
      userSnapshot = await db
        .collection('users')
        .where('username', '==', lowercaseUsername)
        .get();

      if (userSnapshot.empty) {
        return res.status(404).json({ error: 'User not found!' });
      }
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password!' });
    }

    await db.collection('users').doc(userDoc.id).update({
      onlineStatus: 'online',
    });

    // For now no token
    return res.status(200).json({
      message: 'Successfully logged in!',
      data: {
        userId: userDoc.id,
        username: userData.username,
        email: userData.email,
      },
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ error: 'Login failed!' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and update status to offline
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       400:
 *         description: Missing userId
 *       500:
 *         description: Logout failed
 */

authRoutes.post('/logout', async (req: Request, res: any) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const userRef = db.collection('users').doc(userId);

    await userRef.update({
      onlineStatus: 'offline',
      lastActive: admin.firestore.Timestamp.now(),
    });

    return res.status(200).json({ message: 'User logged out successfully!' });
  } catch (error) {
    console.error('[LOGOUT ERROR]', error);
    res.status(500).json({ error: 'Logout failed!' });
  }
});

/**
 * @swagger
 * /auth/{userId}:
 *   get:
 *     summary: Fetch user details by ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique ID
 *     responses:
 *       200:
 *         description: Successfully fetched user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     username:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     onlineStatus:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     profilePictureUrl:
 *                       type: string
 *                     steamId:
 *                       type: string
 *                     xboxId:
 *                       type: string
 *                     riotId:
 *                       type: string
 *                     twitchId:
 *                       type: string
 *                     youtubeId:
 *                       type: string
 *                     linkedAccounts:
 *                       type: array
 *                       items:
 *                         type: string
 *                     gameLibrary:
 *                       type: array
 *                       items:
 *                         type: string
 *                     numOfGames:
 *                       type: integer
 *                     friendsList:
 *                       type: array
 *                       items:
 *                         type: string
 *                     numOfFriends:
 *                       type: integer
 *                     joinedCommunities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     numOfCommunities:
 *                       type: integer
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user info
 */

authRoutes.get('/:userId', async (req: Request, res: any) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      message: 'Successfully fetch user details!',
      data: {
        userId: userDoc.id,
        onlineStatus: userData?.onlineStatus,
        email: userData?.email,
        username: userData?.username,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        bio: userData?.bio,
        profilePic: userData?.profilePic,
        friendsList: userData?.friendsList,
        numOfFriends: userData?.numOfFriends,
        joinedCommunities: userData?.joinedCommunities,
        numOfCommunities: userData?.numOfCommunities,
        linkedAccounts: userData?.linkedAccounts,
        steamId: userData?.steamId,
        xboxId: userData?.xboxId,
        riotId: userData?.riotId,
        twitchId: userData?.twitchId,
        youtubeId: userData?.youtubeId,
        gameLibrary: userData?.gameLibrary,
        numOfGames: userData?.numOfGames,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user info!' });
  }
});

/**
 * @swagger
 * /auth/{userId}:
 *   patch:
 *     summary: Update basic user profile information
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: User info updated successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user info
 */

authRoutes.patch('/:userId', async (req: Request, res: any) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, username, bio } = req.body;

    if (!username || !firstName || !lastName || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found!' });
    }

    await userRef.update({
      firstName,
      lastName,
      bio,
      username: username.toLowerCase(),
    });

    return res.status(200).json({ message: 'User info updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user info!' });
  }
});

export default authRoutes;
