import express, { Request } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../firebase/firebase';
import admin from 'firebase-admin';
import { IUser } from '../../schemas/user.schema';

const authRoutes = express.Router();

/**
 * @swagger
 * /auth/register:
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
 *               steamId:
 *                 type: string
 *               xboxId:
 *                 type: string
 *               psnId:
 *                 type: string
 *               nintendoId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already in use or missing fields
 *       500:
 *         description: Registration failed
 */

authRoutes.post('/register', async (req: Request, res: any) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userSnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: IUser = {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      createdAt: admin.firestore.Timestamp.now(),
    };

    const userRef = await db.collection('users').add(newUser);

    return res.status(201).json({
      message: 'User registered successfully',
      userId: userRef.id,
      username,
      email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

export default authRoutes;
