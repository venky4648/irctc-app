# 🚂 IRCTC Clone — Full Stack Application

A full-stack Indian Railways ticket booking app built with **React + Node.js/Express + MongoDB**, styled to look and feel like the real IRCTC portal.

---

## 📁 Project Structure

```
irctc-app/
├── server/               ← Node.js + Express backend
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── trainController.js
│   │   └── bookingController.js
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── train.js
│   │   └── bookings.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── trainRoutes.js
│   │   ├── bookingRoute.js
│   │   └── seedRoutes.js      ← NEW: seed 10 sample trains
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── client/               ← React + Vite frontend
    └── src/
        ├── context/AuthContext.jsx
        ├── utils/api.js
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── SearchTrains.jsx
        │   ├── BookTicket.jsx
        │   ├── MyBookings.jsx
        │   └── PNRStatus.jsx
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`)  
  _Or update `MONGO_URI` in `server/.env` to use MongoDB Atlas_

---

### 1. Start the Backend

```bash
cd server
npm install
npm run dev
```
Server runs at **http://localhost:5000**

---

### 2. Seed the Database with Sample Trains

In a new terminal (or use Postman / curl):

```bash
curl -X POST http://localhost:5000/api/seed/trains
```

This inserts **10 popular Indian trains** (Rajdhani, Shatabdi, Duronto, etc.) into MongoDB.

---

### 3. Start the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## 🌟 Features

### User Features
| Feature | Details |
|---|---|
| 🔐 **Auth** | Register / Login with JWT, password hashing via bcrypt |
| 🔍 **Search Trains** | Search by source & destination with real-time results |
| 🪑 **Seat Availability** | Live seat count per class (General, 3A, 2A, 1A) |
| 🎫 **Book Tickets** | Add up to 6 passengers, choose berth preference |
| 💳 **Payment** | Simulated UPI / Net Banking / Debit/Credit Card flow |
| 📄 **PNR Status** | Check any booking by PNR number (public route) |
| 📋 **My Bookings** | View all personal bookings with passenger details |
| ❌ **Cancel Ticket** | Cancel confirmed bookings; seats restored automatically |

### Admin Features
- Add new trains via `POST /api/trains/add` (requires auth token)
- Manage users via `GET /api/auth/users` (admin role only)

---

## 🛣️ API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/profile` | Get own profile | ✅ |
| PUT | `/api/auth/updateprofile` | Update own profile | ✅ |
| GET | `/api/auth/users` | Get all users (admin) | ✅ |

### Trains
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/trains/all` | Get all trains | ❌ |
| GET | `/api/trains/search?from=X&to=Y` | Search trains by route | ❌ |
| POST | `/api/trains/add` | Add new train | ✅ |

### Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/bookings/check-availability` | Check seats & get fare | ✅ |
| POST | `/api/bookings/book` | Book a ticket | ✅ |
| GET | `/api/bookings/my-bookings` | Get user's bookings | ✅ |
| GET | `/api/bookings/pnr/:pnr` | Check PNR status | ❌ |
| DELETE | `/api/bookings/cancel/:id` | Cancel booking | ✅ |

### Seed
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/seed/trains` | Insert 10 sample trains |

---

## 🚂 Sample Trains (after seeding)

| Train # | Name | Route |
|---|---|---|
| 12301 | Rajdhani Express | New Delhi → Howrah |
| 12951 | Mumbai Rajdhani | New Delhi → Mumbai Central |
| 22691 | Rajdhani Express | New Delhi → Bangalore |
| 12002 | Bhopal Shatabdi | New Delhi → Bhopal |
| 12260 | Duronto Express | New Delhi → Sealdah |
| 12627 | Karnataka Express | New Delhi → Bangalore City |
| 12909 | Garib Rath | Mumbai Central → Howrah |
| 12589 | Gorakhpur Express | Gorakhpur → Mumbai CST |
| 12431 | Trivandrum Rajdhani | New Delhi → Trivandrum |
| 12616 | Grand Trunk Express | New Delhi → Chennai Central |

---

## 🎨 Tech Stack

**Frontend:** React 18, Vite, React Router v6, Axios, react-hot-toast, Lucide React  
**Backend:** Node.js, Express 5, Mongoose, JWT, bcryptjs, dotenv, cors  
**Database:** MongoDB

---

## 📝 Environment Variables (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/IRCTC
JWT_SECRET=koatvenkatesheirctcsecretkey
```

To use MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.
