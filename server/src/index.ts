import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import './firebase/firebase';
import authRoutes from './routes/auth';
import socialRoutes from './routes/social';
import popularGamesRoute from './routes/game';
import serviceRoutes from './routes/service';
import messageRoutes from './routes/message';
import steamRoutes from './routes/steam';
import riotRoutes from './routes/riot';
import communityRoutes from './routes/community';
import gameRoute from './routes/gameRoute';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/search', serviceRoutes);
app.use('/api/popular-games', popularGamesRoute);
app.use('/api/message', messageRoutes);
app.use('/api/steam', steamRoutes);
app.use('/api/riot', riotRoutes);
app.use('/api', communityRoutes);
app.use('/api', gameRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/api/docs`);
});
