import express, { Request } from 'express';
import { db } from '../firebase/firebase';
import admin from 'firebase-admin';
import { IMessage } from '../schemas/message.schema';

const messageRoutes = express.Router();

/**
 * @swagger
 * /message/start-chat:
 *   post:
 *     summary: Start a chat between two users (creates if not exists)
 *     tags: [Message]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user1Id
 *               - user2Id
 *             properties:
 *               user1Id:
 *                 type: string
 *                 description: ID of the first user
 *               user2Id:
 *                 type: string
 *                 description: ID of the second user
 *     responses:
 *       200:
 *         description: Chat created or already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatId:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

messageRoutes.post('/start-chat', async (req: Request, res: any) => {
  try {
    const { user1Id, user2Id } = req.body;

    if (!user1Id || !user2Id) {
      return res.status(404).json({
        error: 'Missing required fields!',
      });
    }

    const chatId =
      user1Id < user2Id ? `${user1Id}_${user2Id}` : `${user2Id}_${user1Id}`;

    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      await chatRef.set({
        participants: [user1Id, user2Id],
        createdAt: admin.firestore.Timestamp.now(),
      });
    }

    return res.status(200).json({ message: 'Chat created!', chatId });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start a chat!' });
  }
});

/**
 * @swagger
 * /message/send-message:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [Message]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatId
 *               - senderId
 *               - text
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: ID of the chat
 *               senderId:
 *                 type: string
 *                 description: ID of the user sending the message
 *               text:
 *                 type: string
 *                 description: The message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

messageRoutes.post('/send-message', async (req: Request, res: any) => {
  try {
    const { chatId, senderId, text } = req.body;

    if (!chatId || !senderId || !text) {
      return res.status(404).json({ error: 'Missing required fields!' });
    }

    const message = {
      senderId,
      text,
      sentAt: admin.firestore.Timestamp.now(),
    };

    await db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add(message);

    return res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send message!' });
  }
});

/**
 * @swagger
 * /message/messages/{chatId}:
 *   get:
 *     summary: Get all messages in a chat
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat
 *     responses:
 *       200:
 *         description: Successfully fetched messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       senderId:
 *                         type: string
 *                       text:
 *                         type: string
 *                       sentAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

messageRoutes.get('/messages/:chatId', async (req: Request, res: any) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(404).json({ error: 'Missing required fields!' });
    }

    const messagesSnapshot = await db
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('sentAt', 'asc')
      .get();

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      message: 'Successfully fetched messages!',
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch message!' });
  }
});

/**
 * @swagger
 * /message/chats/{userId}:
 *   get:
 *     summary: Get all chats involving the specified user
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose chats to fetch
 *     responses:
 *       200:
 *         description: Successfully fetched user chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       chatId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       username:
 *                         type: string
 *                       profilePic:
 *                         type: string
 *                       onlineStatus:
 *                         type: string
 *                         enum: [online, offline]
 *       500:
 *         description: Failed to fetch chats
 */

messageRoutes.get('/chats/:userId', async (req: Request, res: any) => {
  try {
    const { userId } = req.params;

    const snapshot = await db
      .collection('chats')
      .where('participants', 'array-contains', userId)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ message: 'No chats found', data: [] });
    }

    const chats = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        const chatId = doc.id;

        const otherUserId = chatData.participants.find(
          (id: string) => id !== userId
        );
        if (!otherUserId) return null;

        const otherUserSnap = await db
          .collection('users')
          .doc(otherUserId)
          .get();
        if (!otherUserSnap.exists) return null;

        const otherUser = otherUserSnap.data();

        return {
          chatId,
          userId: otherUserId,
          username: otherUser?.username || 'Unknown',
          profilePic: otherUser?.profilePictureUrl || '',
          onlineStatus: otherUser?.onlineStatus || 'offline',
        };
      })
    );

    const validChats = chats.filter(Boolean);

    res.status(200).json({
      message: 'Fetched user chats successfully',
      data: validChats,
    });
  } catch (error) {
    console.error('[CHAT FETCH ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

export default messageRoutes;
