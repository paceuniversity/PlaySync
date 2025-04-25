import express, { Request } from 'express';
import { db } from '../firebase/firebase';
import admin from 'firebase-admin';

const steamRoutes = express.Router();

export default steamRoutes;
