import express, { Request } from 'express';
import { db } from '../firebase/firebase';
import admin from 'firebase-admin';
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

    if (!recipientId || !requestorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const recipientRef = db.collection('users').doc(recipientId);
    const recipientDoc = await recipientRef.get();

    const requestorRef = db.collection('users').doc(requestorId);
    const requestorDoc = await requestorRef.get();

    if (!recipientDoc.exists || !requestorDoc.exists) {
      return res.status(404).json({ error: 'User not found!' });
    }

    const recipientData = recipientDoc.data();
    const requestorData = requestorDoc.data();

    // Already friends check
    const recipientFriends = recipientData?.friendsList || [];
    const requestorFriends = requestorData?.friendsList || [];

    if (
      recipientFriends.includes(requestorId) ||
      requestorFriends.includes(recipientId)
    ) {
      return res.status(400).json({ error: 'Users are already friends!' });
    }

    // Existing friend request check (in either direction)
    const existingRequests = await db
      .collection('friendReq')
      .where('recipientId', 'in', [recipientId, requestorId])
      .where('requestorId', 'in', [recipientId, requestorId])
      .get();

    const isDuplicate = existingRequests.docs.some((doc) => {
      const data = doc.data();
      return (
        (data.recipientId === recipientId &&
          data.requestorId === requestorId) ||
        (data.recipientId === requestorId && data.requestorId === recipientId)
      );
    });

    if (isDuplicate) {
      return res.status(400).json({ error: 'Friend request already exists!' });
    }

    const newRequest: IFriendRequest = {
      recipientId,
      requestorId,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
    };

    const requestRef = await db.collection('friendReq').add(newRequest);
    const friendReqId = requestRef.id;

    try {
      await recipientRef.update({
        friendRequests: admin.firestore.FieldValue.arrayUnion(friendReqId),
      });

      return res.status(201).json({
        message: 'Friend request created successfully!',
        reqId: friendReqId,
        recipientId,
        requestorId,
      });
    } catch (error) {
      await requestRef.delete();
      return res.status(500).json({
        error: 'Failed to link friend request to recipient. Request deleted.',
      });
    }
  } catch (error) {
    console.error('[FRIEND REQUEST ERROR]', error);
    res.status(500).json({ error: 'Failed to create friend request!' });
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
      return res.status(404).json({ error: 'Request not found!' });
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




export default socialRoutes;
