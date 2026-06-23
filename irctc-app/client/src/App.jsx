import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
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
      </BrowserRouter>
    </AuthProvider>
  );
}
