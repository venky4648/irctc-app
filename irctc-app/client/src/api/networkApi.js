import API from '../utils/api';

export const networkApi = {
    searchStations: (query = '') => API.get(`/network/stations?search=${encodeURIComponent(query)}`),
    getStation: (id) => API.get(`/network/stations/${id}`),
    addStation: (payload) => API.post('/network/stations', payload),
    updateStation: (id, payload) => API.put(`/network/stations/${id}`, payload),
    deleteStation: (id) => API.delete(`/network/stations/${id}`),
    
    searchRoutes: (query = '') => API.get(`/network/routes?search=${encodeURIComponent(query)}`),
    getRoute: (id) => API.get(`/network/routes/${id}`),
    addRoute: (payload) => API.post('/network/routes', payload),
    updateRoute: (id, payload) => API.put(`/network/routes/${id}`, payload),
    deleteRoute: (id) => API.delete(`/network/routes/${id}`)
};
