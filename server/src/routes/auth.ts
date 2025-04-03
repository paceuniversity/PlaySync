import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../firebase/firebase';
import admin from 'firebase-admin';
import { IUser } from '../schemas/user.schema'; 

const authRoutes = express.Router();

authRoutes.post('/register', async (req: Request, res: any) => {
  try {
    const { username, email, password, steamId, xboxId, psnId, nintendoId } =
      req.body;

    if (!username || !email || !password) {
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

    const linkedAccounts = [];
    if (steamId) linkedAccounts.push('steamId');
    if (xboxId) linkedAccounts.push('xboxId');
    if (psnId) linkedAccounts.push('psnId');
    if (nintendoId) linkedAccounts.push('nintendoId');

    const newUser: IUser = {
      username,
      email,
      password: hashedPassword,
      steamId,
      xboxId,
      psnId,
      nintendoId,
      linkedAccounts,
      createdAt: admin.firestore.Timestamp.now(),
    };

    const userRef = await db.collection('users').add(newUser);

    return res.status(201).json({
      message: 'User registered successfully',
      userId: userRef.id,
      username,
      email,
      linkedAccounts,
    });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

export default authRoutes;
