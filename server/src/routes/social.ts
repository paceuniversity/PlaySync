import express, { Request } from 'express';
import admin from 'firebase-admin';
import { db } from '../firebase/firebase';
import { IFriendRequest } from '../schemas/friend-request.schema';

const socialRoutes = express.Router();

/**
 * @swagger
 * /social/request:
 *   post:
 *     summary: Send a friend request to another user
 *     tags: [Social]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - requestorId
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: The user ID of the recipient
 *               requestorId:
 *                 type: string
 *                 description: The user ID of the sender
 *     responses:
 *       201:
 *         description: Friend request created and linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 requestId:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Recipient user not found
 *       500:
 *         description: Failed to create or link the friend request
 */

socialRoutes.post('/request', async (req: Request, res: any) => {
  try {
    const { recipientId, requestorId } = req.body;

    if (!recipientId || !requestorId)
      return res.status(400).json({ error: 'Missing fields' });

    const [recipientSnap, requestorSnap] = await Promise.all([
      db.collection('users').doc(recipientId).get(),
      db.collection('users').doc(requestorId).get(),
    ]);

    if (!recipientSnap.exists || !requestorSnap.exists)
      return res.status(404).json({ error: 'User not found!' });

    const recipientData = recipientSnap.data();
    const requestorData = requestorSnap.data();

    const alreadyFriends =
      (recipientData?.friendsList || []).includes(requestorId) ||
      (requestorData?.friendsList || []).includes(recipientId);

    if (alreadyFriends)
      return res.status(400).json({ error: 'Users are already friends!' });

    const existingReqsQuery = await db
      .collection('friendReq')
      .where('recipientId', 'in', [recipientId, requestorId])
      .where('requestorId', 'in', [recipientId, requestorId])
      .get();

    const isDuplicate = existingReqsQuery.docs.some((doc) => {
      const d = doc.data();
      return (
        (d.recipientId === recipientId && d.requestorId === requestorId) ||
        (d.recipientId === requestorId && d.requestorId === recipientId)
      );
    });

    if (isDuplicate)
      return res.status(400).json({ error: 'Friend request already exists!' });

    const newRequest: IFriendRequest = {
      recipientId,
      requestorId,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
    };

    const reqRef = await db.collection('friendReq').add(newRequest);

    try {
      await db
        .collection('users')
        .doc(recipientId)
        .update({
          friendRequests: admin.firestore.FieldValue.arrayUnion(reqRef.id),
        });

      return res.status(201).json({
        message: 'Friend request sent!',
        reqId: reqRef.id,
        recipientId,
        requestorId,
      });
    } catch (err) {
      await reqRef.delete();
      return res
        .status(500)
        .json({ error: 'Linking failed, request deleted.' });
    }
  } catch (err) {
    console.error('[FRIEND REQUEST ERROR]', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * @swagger
 * /social/{reqId}:
 *   get:
 *     summary: Get a specific friend request by ID
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: reqId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the friend request
 *     responses:
 *       200:
 *         description: Successfully fetched request details
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
 *                     reqId:
 *                       type: string
 *                     recipientId:
 *                       type: string
 *                     requestorId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [pending, accept, rejected]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Request not found
 *       500:
 *         description: Failed to fetch request info
 */

socialRoutes.get('/:reqId', async (req: Request, res: any) => {
  try {
    const { reqId } = req.params;

    if (!reqId) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const reqRef = db.collection('friendReq').doc(reqId);
    const reqDoc = await reqRef.get();

    if (!reqDoc.exists) {
      return res.status(404).json({ error: 'Request not found!' });
    }

    const reqData = reqDoc.data();

    return res.status(200).json({
      message: 'Successfully fetched request details!',
      data: {
        reqId: reqDoc.id,
        recipientId: reqData?.recipientId,
        requestorId: reqData?.requestorId,
        status: reqData?.status,
        createdAt: reqData?.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request info!' });
  }
});

/**
 * @swagger
 * /social/requests/{userId}:
 *   get:
 *     summary: Get all pending friend requests for a specific user
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve friend requests for
 *     responses:
 *       200:
 *         description: Successfully fetched friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 total:
 *                   type: integer
 *                   description: Total number of pending friend requests
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reqId:
 *                         type: string
 *                         description: Friend request document ID
 *                       requestorId:
 *                         type: string
 *                         description: ID of the user who sent the request
 *                       requestorUsername:
 *                         type: string
 *                         description: Username of the user who sent the request
 *                       status:
 *                         type: string
 *                         enum: [pending, accept, rejected]
 *                         description: Status of the friend request
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the request was created
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user's friend requests
 */


socialRoutes.get('/requests/:userId', async (req: Request, res: any) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const friendReqSnapshot = await db
      .collection('friendReq')
      .where('recipientId', '==', userId)
      .where('status', '==', 'pending')
      .get();

    const totalRequests = friendReqSnapshot.size;

    if (friendReqSnapshot.empty) {
      return res
        .status(200)
        .json({ message: 'No friend requests found!', data: [] });
    }

    const requestData = await Promise.all(
      friendReqSnapshot.docs.map(async (doc) => {
        const reqData = doc.data();

        const requestorSnap = await db
          .collection('users')
          .doc(reqData.requestorId)
          .get();
        const requestorData = requestorSnap.exists ? requestorSnap.data() : {};

        return {
          reqId: doc.id,
          requestorId: reqData.requestorId,
          requestorUsername: requestorData?.username || '',
          status: reqData.status,
          createdAt: reqData.createdAt.toDate().toISOString(),
        };
      })
    );

    return res.status(200).json({
      message: "Successfully fetched user's friend requests!",
      total: totalRequests,
      data: requestData,
    });
  } catch (error) {
    console.error('[FRIEND REQUEST FETCH ERROR]', error);
    res.status(500).json({ error: `Failed to fetch user's friend requests!` });
  }
});

/**
 * @swagger
 * /social/friends/{userId}:
 *   get:
 *     summary: Get a user's list of friends (with pagination)
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose friends list to fetch
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of friends to return (pagination limit)
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of friends to skip (pagination offset)
 *     responses:
 *       200:
 *         description: Successfully fetched friends list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 total:
 *                   type: integer
 *                   description: Total number of friends
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       username:
 *                         type: string
 *                       profilePictureUrl:
 *                         type: string
 *                       onlineStatus:
 *                         type: string
 *                         enum: [online, offline]
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user's friends
 */

socialRoutes.get('/friends/:userId', async (req: Request, res: any) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnap.data();
    const friendsList: string[] = userData?.friendsList || [];

    if (!friendsList.length) {
      return res.status(200).json({
        message: 'User has no friends!',
        total: 0,
        data: [],
      });
    }

    const totalFriends = friendsList.length;
    const paginatedFriendsList = friendsList.slice(offset, offset + limit);

    const batch = await db.getAll(
      ...paginatedFriendsList.map((id) => db.collection('users').doc(id))
    );

    const friends = batch
      .filter((doc) => doc.exists)
      .map((doc) => {
        const d = doc.data();
        return {
          userId: doc.id,
          username: d?.username,
          profilePictureUrl: d?.profilePictureUrl,
          onlineStatus: d?.onlineStatus,
        };
      });

    res.status(200).json({
      message: 'Fetched friends list!',
      total: totalFriends,
      data: friends,
    });
  } catch (err) {
    console.error('[FETCH FRIENDS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

/**
 * @swagger
 * /social/{reqId}:
 *   patch:
 *     summary: Respond to a friend request (accept or decline)
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: reqId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the friend request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userReq
 *             properties:
 *               userReq:
 *                 type: string
 *                 enum: [accept, decline]
 *                 description: Indicates whether the request is accepted or declined
 *     responses:
 *       200:
 *         description: Friend request processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields or invalid userReq value
 *       404:
 *         description: User or friend request not found
 *       500:
 *         description: Failed to update request info
 */

socialRoutes.patch('/:reqId', async (req: Request, res: any) => {
  try {
    const { reqId } = req.params;
    const { userReq } = req.body;

    if (!reqId || !userReq) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const reqRef = db.collection('friendReq').doc(reqId);
    const reqDoc = await reqRef.get();

    if (!reqDoc.exists) {
      return res.status(404).json({ error: 'User has no requests!' });
    }

    const reqData = reqDoc.data();

    const requestorId = reqData?.requestorId;
    const recipientId = reqData?.recipientId;

    const recipientRef = db.collection('users').doc(recipientId);
    const recipientDoc = await recipientRef.get();

    const requestorRef = db.collection('users').doc(requestorId);
    const requestorDoc = await requestorRef.get();

    if (!recipientDoc.exists || !requestorDoc.exists) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const recipientData = recipientDoc.data();
    const requestorData = requestorDoc.data();

    try {
      if (userReq === 'accept') {
        await recipientRef.update({
          friendsList: [...(recipientData?.friendsList || []), requestorId],
          numOfFriends: recipientData?.numOfFriends + 1,
          friendRequests: (recipientData?.friendRequests || []).filter(
            (id: string) => id !== reqId
          ),
        });

        await requestorRef.update({
          friendsList: [...(requestorData?.friendsList || []), recipientId],
          numOfFriends: requestorData?.numOfFriends + 1,
        });

        await reqRef.delete();

        return res.status(200).json({ message: 'Friend request accepted!' });
      }

      if (userReq === 'decline') {
        await recipientRef.update({
          friendRequests: (recipientData?.friendRequests || []).filter(
            (id: string) => id !== reqId
          ),
        });

        await reqRef.delete();

        return res.status(200).json({ message: 'Friend request declined!' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update request info!' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request info!' });
  }
});

/**
 * @swagger
 * /social/{reqId}:
 *   delete:
 *     summary: Cancel a friend request
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: reqId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the friend request to cancel
 *     responses:
 *       200:
 *         description: Friend request canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Friend request or recipient user not found
 *       500:
 *         description: Failed to cancel friend request
 */

socialRoutes.delete('/:reqId', async (req: Request, res: any) => {
  try {
    const { reqId } = req.params;

    if (!reqId) {
      return res.status(400).json({ error: 'Missing required fields!' });
    }

    const reqRef = db.collection('friendReq').doc(reqId);
    const reqDoc = await reqRef.get();

    if (!reqDoc.exists) {
      return res.status(404).json({ error: 'Request not found!' });
    }

    const reqData = reqDoc.data();

    const recipientId = reqData?.recipientId;
    const recipientRef = db.collection('users').doc(recipientId);
    const recipientDoc = await recipientRef.get();

    if (!recipientDoc.exists) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const recipientData = recipientDoc.data();

    try {
      await recipientRef.update({
        friendRequests: (recipientData?.friendRequests || []).filter(
          (id: string) => id !== reqId
        ),
      });
    } catch (error) {
      return res
        .status(200)
        .json({ message: 'Failed to cancel friend request!' });
    }

    await reqRef.delete();
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel friend request!' });
  }
});

/**
 * @swagger
 * /social/{userId}:
 *   delete:
 *     summary: Remove a user from the current user's friend list
 *     tags: [Social]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the current user removing a friend
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friendUsername
 *             properties:
 *               friendUsername:
 *                 type: string
 *                 description: The username of the friend to remove
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing fields or users not friends
 *       404:
 *         description: User or friend not found
 *       500:
 *         description: Failed to remove friend
 */

socialRoutes.delete(
  '/remove-friend/:userId',
  async (req: Request, res: any) => {
    try {
      const { userId } = req.params;
      const { friendUsername } = req.body;

      if (!userId || !friendUsername) {
        return res.status(400).json({ error: 'Missing required fields!' });
      }

      const userSnapshot = await db
        .collection('users')
        .where('username', '==', friendUsername.toLowerCase())
        .get();

      if (userSnapshot.empty) {
        return res.status(404).json({ error: 'Friend not found!' });
      }

      const friendDoc = userSnapshot.docs[0];
      const friendData = friendDoc.data();
      const friendId = friendDoc.id;

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found!' });
      }

      const userData = userDoc.data();

      const userFriendsList = userData?.friendsList || [];
      const friendFriendsList = friendData?.friendsList || [];

      if (!userFriendsList.includes(friendId)) {
        return res.status(400).json({ error: 'User is not a friend!' });
      }
      if (!friendFriendsList.includes(userId)) {
        return res
          .status(400)
          .json({ error: 'Friend is not in your friends list!' });
      }

      await userRef.update({
        friendsList: admin.firestore.FieldValue.arrayRemove(friendId),
        numOfFriends: userData?.numOfFriends - 1,
      });
      await db
        .collection('users')
        .doc(friendId)
        .update({
          friendsList: admin.firestore.FieldValue.arrayRemove(userId),
          numOfFriends: friendData?.numOfFriends - 1,
        });
      return res.status(200).json({ message: 'Friend removed successfully!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove friend!' });
    }
  }
);

/**
 * @swagger
 * /social/check-friendship:
 *   post:
 *     summary: Check if two users are friends
 *     tags: [Social]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - friendId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The logged-in user's ID
 *               friendId:
 *                 type: string
 *                 description: The user ID of the user being viewed
 *     responses:
 *       200:
 *         description: Friendship status returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 areFriends:
 *                   type: boolean
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: One or both users not found
 *       500:
 *         description: Internal server error
 */

socialRoutes.post('/check-friendship', async (req: Request, res: any) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ error: 'Missing fields!' });
    }

    const [userSnap, friendSnap] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('users').doc(friendId).get(),
    ]);

    if (!userSnap.exists || !friendSnap.exists) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const userData = userSnap.data();
    const friendData = friendSnap.data();

    const userFriendsList = userData?.friendsList || [];
    const friendFriendsList = friendData?.friendsList || [];

    if (
      userFriendsList.includes(friendId) &&
      friendFriendsList.includes(userId)
    ) {
      return res.status(200).json({ status: 'friend' });
    }

    const pendingRequestsQuery = await db
      .collection('friendReq')
      .where('recipientId', 'in', [userId, friendId])
      .where('requestorId', 'in', [userId, friendId])
      .get();

    if (!pendingRequestsQuery.empty) {
      return res.status(200).json({ status: 'pending' });
    }

    return res.status(200).json({ status: 'none' });
  } catch (error) {
    console.error('[CHECK FRIENDSHIP ERROR]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default socialRoutes;
