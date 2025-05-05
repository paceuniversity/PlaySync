import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5173;

let memberCount = 123;
const communityName = "Game Community";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/community', (req, res) => {
  res.json({
    name: communityName,
    members: memberCount,
    description: "Welcome to X community! Please be respectful, and follow community guidelines",
  });
});

app.post('/api/join', (req, res) => {
  memberCount++;
  res.json({ success: true, members: memberCount });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});