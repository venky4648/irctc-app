import express from 'express';
import dotenv from 'dotenv';
import connectDB from './shared/utils/db.js';
import { logger } from './shared/utils/logger.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './domains/auth/routes/authRoutes.js';
import bookingRoutes from './domains/booking/routes/bookingRoutes.js';
import networkRoutes from './domains/network/routes/networkRoutes.js';
import fleetRoutes from './domains/fleet/routes/fleetRoutes.js';
import seedRoutes from './routes/seedRoutes.js';

dotenv.config();
const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', credentials: true }
});

// Pass io to routes via req
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  // When a user logs in or mounts the app, they can join their specific user room
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

connectDB();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.get('/', (req, res) => {
  res.send('Welcome to the IRCTC Simulation API');
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/seed', seedRoutes);


// Global Error Handler must be the last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
