import API from '../utils/api';

export const fleetApi = {
    getAllTrains: () => API.get('/fleet/trains'),
    searchTrains: (from, to, date) => API.get(`/fleet/trains?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`),
    addTrain: (payload) => API.post('/fleet/trains', payload),
    updateTrain: (id, payload) => API.put(`/fleet/trains/${id}`, payload),
    deleteTrain: (id) => API.delete(`/fleet/trains/${id}`)
};
