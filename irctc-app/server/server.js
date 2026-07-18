import express from 'express';
import dotenv from 'dotenv';
import connectDB from './shared/utils/db.js';
import { logger } from './shared/utils/logger.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import notificationSubscriber from './domains/notification/events/NotificationSubscriber.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './domains/auth/routes/authRoutes.js';
import bookingRoutes from './domains/booking/routes/bookingRoutes.js';
import trainRoutes from './domains/trains/routes/trainRoutes.js';
// import paymentRoutes from './domains/payment/routes/paymentRoutes.js';
import adminRoutes from './domains/admin/routes/adminRoutes.js';
// import analyticsRoutes from './domains/analytics/routes/analyticsRoutes.js';
import searchRoutes from './domains/search/routes/searchRoutes.js';
// import notificationRoutes from './domains/notification/routes/notificationRoutes.js';
// import searchRoutes from './domains/search/routes/searchRoutes.js';
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

import eventBus from './shared/events/EventBus.js';

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

eventBus.on('WL_CONFIRMED', (data) => {
  io.to(data.userId).emit('ticketConfirmed', { ...data, seatNumber: 'CNF (Generated)' });
});

connectDB();
notificationSubscriber.init();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

import rateLimit from 'express-rate-limit';

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for Authentication and Booking
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: 'Too many sensitive requests from this IP, please try again after a minute',
});

app.use('/api/', apiLimiter);

app.get('/', (req, res) => {
  res.send('Welcome to the IRCTC Simulation API');
});

app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/bookings', strictLimiter, bookingRoutes);
app.use('/api/trains', trainRoutes);
// app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
// app.use('/api/seed', seedRoutes);


// Global Error Handler must be the last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
