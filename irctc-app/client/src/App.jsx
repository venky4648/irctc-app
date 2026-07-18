import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchTrains from './pages/SearchTrains';
import BookTicket from './pages/BookTicket';
import MyBookings from './pages/MyBookings';
import PNRStatus from './pages/PNRStatus';
import AdminDashboard from './pages/AdminDashboard';
import TrainSchedule from './pages/TrainSchedule';
import { socket } from './utils/socket';
import { useEffect } from 'react';

function SocketManager({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    socket.connect();

    if (user) {
      socket.emit('join_user_room', user.id || user._id);
    }

    const onTicketConfirmed = (payload) => {
      toast.success(
        <div>
          <strong>Congratulations!</strong><br />
          Your waiting list ticket has been confirmed.<br />
          <span style={{ fontSize: '12px' }}>{payload.passengerName} (Seat: {payload.seatNumber})</span>
        </div>,
        { duration: 6000 }
      );
    };

    socket.on('ticketConfirmed', onTicketConfirmed);

    return () => {
      socket.off('ticketConfirmed', onTicketConfirmed);
    };
  }, [user]);

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '10px', fontSize: '14px', fontWeight: 500 },
            success: { style: { background: '#f0faf4', color: '#1a6b36', border: '1px solid #b2dfcb' } },
            error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
          }}
        />
        <SocketManager>
          <Navbar />
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/search"      element={<SearchTrains />} />
            <Route path="/pnr"         element={<PNRStatus />} />
            <Route path="/schedule"    element={<TrainSchedule />} />
            <Route path="/book/:trainId" element={
              <ProtectedRoute><BookTicket /></ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute><MyBookings /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />
          </Routes>
        </SocketManager>
      </BrowserRouter>
    </AuthProvider>
  );
}
