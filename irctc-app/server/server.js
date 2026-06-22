import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import trainRoutes from './routes/trainRoutes.js';
import bookingRoutes from './routes/bookingRoute.js';
import seedRoutes from './routes/seedRoutes.js';

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.get('/', (req, res) => {
  res.send('Welcome to the IRCTC Simulation API');
});

app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/seed', seedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
