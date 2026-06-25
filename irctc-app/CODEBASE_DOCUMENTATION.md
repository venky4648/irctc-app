# Comprehensive Codebase Documentation

This document provides a highly detailed, file-by-file breakdown of the entire IRCTC Clone project. It explains exactly what each file does, how the pieces fit together, and how to navigate the system.

---

## 1. Project Setup & Execution

### How to Run the Project
You need to run the Frontend and Backend simultaneously in two separate terminals.
- **Backend**: Navigate to `irctc-app/server` and run `npm run dev` or `npm start`. (Runs on port 5000)
- **Frontend**: Navigate to `irctc-app/client` and run `npm run dev`. (Runs on port 5173)

---

## 2. Backend Files (`/server`)

The backend is built with Node.js, Express, and MongoDB.

### Entry Point
#### `server.js`
- **What it does**: This is the heart of the backend. It initializes the Express application, connects to MongoDB using Mongoose, enables CORS (so the frontend can communicate with it), and registers the API routes.
- **How to use it**: You rarely need to modify this unless you are adding a completely new category of routes (e.g., `/api/payments`).

### Database Models (`/server/models`)
These files define the structure of the data saved in MongoDB.
- **`user.js`**: Defines the user schema (`name`, `email`, `password`, `role`). Includes a pre-save hook to automatically hash passwords using `bcrypt` before they are stored.
- **`train.js`**: Defines the core Train schema. Stores global details like `trainName`, `trainNumber`, `scheduleType` (DAILY/WEEKLY/SPECIAL), and pricing/capacity for each class (AC1, AC2, AC3, General).
- **`trainRoute.js`**: Defines individual stops along a train's journey. Links to a specific `Train` via its ID and stores `stationName`, `arrivalTime`, `departureTime`, and `stationOrder`.
- **`seatOccupancy.js`**: Critical for the Segment-Based Booking system. It tracks individual booked seats. Instead of storing just "Seat 12 is booked", it stores `trainId`, `journeyDate`, `travelClass`, `seatNumber`, and an array of `segmentIndex`. This allows Seat 12 to be booked from Station A to B, but remain free from B to C.
- **`bookings.js`**: Defines the final Ticket structure. Stores the User ID, Train ID, a randomly generated PNR, journey date, and an array of `passengers` (name, age, berth).

### Business Logic (`/server/controllers`)
These files contain the actual logic that runs when an API endpoint is hit.
- **`authController.js`**: Contains `register` (creates new user) and `login` (verifies password and generates a JSON Web Token - JWT).
- **`trainController.js`**:
  - `addTrain` / `updateTrain`: Used by the Admin Dashboard to save train data.
  - `searchTrains`: The intelligent search engine. It loops through all trains and their `TrainRoute` collections. If the user searches for *Station A* to *Station C*, it verifies that *Station A* comes before *Station C* in `stationOrder`. It also dynamically queries the `SeatOccupancy` collection to calculate exact segment-based availability.
- **`bookingController.js`**:
  - `getRequiredSegments`: A helper function that looks at the `TrainRoute` to determine exactly which segment indexes a user's journey covers.
  - `checkAvailabilityAndGetAmount`: Used by the frontend to confirm real-time seat counts before the user enters passenger details.
  - `bookTrain`: The final booking execution. It verifies seat availability one last time, simulates a payment, creates `SeatOccupancy` records to lock the seats for those specific segments, and generates a `Booking` ticket.

### API Routing (`/server/routes`)
These files map URLs to the controller functions.
- **`authRoute.js`**: Maps `/register` and `/login`.
- **`trainRoute.js`**: Maps endpoints like `/add`, `/update/:id`, and `/search`. It applies `authMiddleware` and `adminMiddleware` to ensure only admins can add trains.
- **`bookingRoute.js`**: Maps `/book` and `/my-bookings`. Requires standard user authentication.

### Middleware (`/server/middleware`)
- **`authMiddleware.js`**: Intercepts requests that require a logged-in user. It reads the JWT token from the `Authorization` header, decodes it, and attaches the user information to the request. It also exports an `adminMiddleware` to block non-admin users from sensitive routes.

---

## 3. Frontend Files (`/client/src`)

The frontend is a React application styled primarily with inline CSS and CSS Variables.

### Application Shell
- **`main.jsx`**: Mounts the React application to the DOM.
- **`App.jsx`**: Defines the React Router structure. It wraps all pages in the `AuthProvider` and maps URLs (e.g., `/search`, `/book/:trainId`, `/admin`) to their respective page components.
- **`context/AuthContext.jsx`**: Provides a global state for the logged-in user. It automatically checks `localStorage` for a saved JWT token on startup so users stay logged in after refreshing.

### Core Pages (`/client/src/pages`)
These are the main screens the user interacts with.
- **`SearchTrains.jsx`**:
  - **What it does**: The main interface for finding trains.
  - **How it works**: Uses a `useEffect` with a 500ms `setTimeout` debounce. When the user types in the `from` or `to` boxes, it waits half a second after they stop typing, then automatically fires a request to `/api/trains/search`. It smartly displays the *local* departure and arrival times for the requested stations by checking the train's route array.
- **`TrainSchedule.jsx`**:
  - **What it does**: A dedicated page for viewing live train timetables.
  - **How it works**: Fetches all trains on mount. It features a fast autocomplete search bar that filters trains by name or number. Once a train is selected, it renders a complex visual timeline using the train's `route` array to map out every station stop, arrival/departure times, and distance.
- **`BookTicket.jsx`**:
  - **What it does**: The 3-step wizard for confirming a ticket (1. Enter Passengers, 2. Payment, 3. Success Ticket).
  - **How it works**: Reads the `trainId`, `from`, and `to` stations from the URL parameters. It calls `/bookings/check-availability` in the background to ensure seats exist. When "Pay & Book" is clicked, it sends the payload to the backend and displays the generated PNR.
- **`AdminDashboard.jsx`**:
  - **What it does**: The management portal restricted to users with the `admin` role.
  - **How it works**: Uses a static sidebar layout to switch between viewing all trains, adding a new train, and managing users. The "Add Train" form is highly complex—it allows admins to dynamically add rows for `TrainRoute` stations, setting individual arrival and departure times for each stop.
- **`Login.jsx` & `Register.jsx`**:
  - **What they do**: Standard authentication forms. On successful login, the JWT token is saved to `localStorage` and the user is redirected to the home page.
- **`MyBookings.jsx`**:
  - **What it does**: Fetches `/api/bookings/my-bookings` to display all tickets the logged-in user has purchased, showing PNR, Passenger names, and Journey details.

### Utilities (`/client/src/utils`)
- **`api.js`**: A centralized Axios instance.
  - **How it works**: Instead of writing `http://localhost:5000/api` in every file, they import this API. It includes an *interceptor* that automatically attaches the JWT token from `localStorage` to every outgoing request, ensuring the backend knows who is making the request.

---

## 4. How to Perform Common Developer Tasks

**Q: How do I add a new field to a Train (e.g., "WiFi Available")?**
1. **Backend Model**: Open `server/models/train.js` and add `hasWifi: { type: Boolean, default: false }` to the schema.
2. **Backend Controller**: You don't need to change `trainController.js` because it uses `req.body` directly to save data.
3. **Frontend Admin**: Open `client/src/pages/AdminDashboard.jsx`, add a checkbox for `hasWifi`, and link it to the `trainData` state.
4. **Frontend Display**: Open `client/src/pages/SearchTrains.jsx` and render a WiFi icon if `train.hasWifi` is true.

**Q: How do I change the color scheme of the website?**
1. Open `client/src/index.css`.
2. Locate the `:root` pseudo-class.
3. Modify the CSS variables like `--irctc-blue`, `--irctc-orange`, or `--irctc-bg` to instantly update the theme across the entire application.

**Q: How do I debug API errors?**
1. **Frontend**: Open Chrome Developer Tools, go to the **Network** tab, click on the failed red request (e.g., `book`), and check the "Response" tab to read the exact error message sent by the server.
2. **Backend**: Check the terminal running `npm start`. If the server crashes, the exact line number of the crash will be printed in the stack trace.
