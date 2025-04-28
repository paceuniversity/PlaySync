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
      res.status(404).json({
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
    res.status(500).json({ error: 'Failed to start a chat!' });
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
      res.status(404).json({ error: 'Missing required fields!' });
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
    res.status(500).json({ error: 'Failed to send message!' });
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
      res.status(404).json({ error: 'Missing required fields!' });
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
    res.status(500).json({ error: 'Failed to fetch message!' });
  }
});

export default messageRoutes;
