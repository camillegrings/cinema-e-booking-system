import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Cinema E-Booking API is running!');
});

app.get('/api/movies', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM movies');
    res.json(rows);
  } catch (error) {
    console.error('MySQL Query Error:', error);
    res.status(500).json({ error: 'Failed to fetch movies from database' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});