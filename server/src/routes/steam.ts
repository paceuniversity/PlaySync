import express, { Request } from 'express';
import { Issuer, Strategy } from 'openid-client';
import { db } from '../firebase/firebase';
import session from 'express-session';
import admin from 'firebase-admin';

const steamRoutes = express.Router();

steamRoutes.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

let steamClient: any;

(async () => {
  const steamIssuer = await Issuer.discover(
    'https://steamcommunity.com/openid'
  );
  steamClient = new steamIssuer.Client({
    client_id: 'steam',
    redirect_uris: ['http://localhost:3000/auth/steam/return'],
    response_types: ['id_token'],
  });
})();

steamRoutes.get('/auth/steam', async (req, res) => {
  const redirectUrl = steamClient.authorizationUrl({
    scope: 'openid',
  });
  res.redirect(redirectUrl);
});

export default steamRoutes;
