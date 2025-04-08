import express, { Request } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../firebase/firebase';

const authRoutes = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in!
 *       400:
 *         description: User does not exist!
 *       500:
 *         description: Login failed!
 */

authRoutes.post('/login', async (req: Request, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userSnapshot = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // For now no token, will add later
    return res.status(200).json({
      message: 'User successfully logged in!',
      userId: userDoc.id,
      username: userData.username,
      email: userData.email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});
