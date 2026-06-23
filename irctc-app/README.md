# IRCTC Clone Application 🚄

A fully-featured, modern clone of the IRCTC Railway Booking System. Built with the **MERN Stack** (MongoDB, Express, React, Node.js), this application mirrors the complex, real-world logic of train scheduling, intelligent route-based searching, and segment-aware seat booking.

---

## 🌟 Key Features

- **Intelligent Route Search**: Automatically parses complete train routes. Search for any intermediate boarding and destination stations, and the system dynamically finds trains passing through them in the correct order.
- **Segment-Based Seat Availability**: Seats are dynamically freed up! If a passenger books a seat from Station A to B, the exact same seat becomes available for booking from Station B to C.
- **Real-Time Booking Engine**: Instant, debounced searching and highly accurate live seat capacity verification before checkout.
- **Admin Management Portal**: A secure dashboard restricted to administrators to effortlessly add complex multi-day train routes, manage prices, and schedule frequencies (Daily, Weekly, Special).
- **Secure Authentication**: Encrypted passwords and JWT-based session management.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, React Router DOM, CSS Variables for seamless theming.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB & Mongoose.
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Running locally or a MongoDB Atlas URI)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd irctc-app/server
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `/server` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd irctc-app/client
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
   *The application should now be live on `http://localhost:5173`.*

---

## 👨‍💻 Admin Access
To manage trains, you need an Administrator account. 
Register a new account on the application, then directly update their `role` field to `"admin"` inside your MongoDB database collection. Once updated, log out and log back in to access the Admin Dashboard.
