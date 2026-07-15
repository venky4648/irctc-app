import API from '../utils/api';

export const bookingApi = {
    getPNRStatus: (pnr) => API.get(`/bookings/pnr/${pnr}`),
    getMyBookings: () => API.get('/bookings/my-bookings'),
    cancelBooking: (id) => API.delete(`/bookings/${id}`),
    cancelPassenger: (bookingId, passengerId) => API.delete(`/bookings/${bookingId}/passenger/${passengerId}`),
    checkAvailability: (payload) => API.post('/bookings/check-availability', payload),
    bookTicket: (payload) => API.post('/bookings', payload)
};
