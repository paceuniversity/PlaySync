import express, { Request } from 'express';
import { db } from '../firebase/firebase';

const serviceRoutes = express.Router();

/**
 * @swagger
 * /search/{type}:
 *   get:
 *     summary: Search resources (e.g., users) by query
 *     tags: [Service]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [username]
 *         description: The type of resource to search (e.g., "username")
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The value to search for (e.g., the username)
 *     responses:
 *       200:
 *         description: Resource found and returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched user details!
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     username:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     profilePic:
 *                       type: string
 *                     onlineStatus:
 *                       type: string
 *                       enum: [online, offline]
 *                     numOfFriends:
 *                       type: number
 *                     numOfCommunities:
 *                       type: number
 *                     numOfGames:
 *                       type: number
 *       400:
 *         description: Missing query parameters or invalid type
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */

serviceRoutes.get('/:type', async (req: Request, res: any) => {
  try {
    const { type } = req.params;
    const { query } = req.query;

    if (!type || !query) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    if (type === 'username') {
      const userSnapshot = await db
        .collection('users')
        .orderBy('username')
        .startAt((query as string).toLowerCase())
        .endAt((query as string).toLowerCase() + '\uf8ff') // Unicode trick to get "starts with"
        .limit(5)
        .get();

      if (userSnapshot.empty) {
        return res.status(404).json({ error: 'No matching users found!' });
      }

      const users = userSnapshot.docs.map((doc) => {
        const userData = doc.data();
        return {
          userId: doc.id,
          username: userData?.username,
          profilePic: userData?.profilePic,
          onlineStatus: userData?.onlineStatus,
        };
      });

      return res.status(200).json({
        message: 'Successfully fetched user list!',
        data: users,
      });
    }

    // Future example: if (type === 'game') { ... }
    // Future example: if (type === 'community') { ... }

    return res.status(400).json({ error: 'Invalid search type!' });
  } catch (error) {
    console.error('[SEARCH ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch info!' });
  }
});

export default serviceRoutes;
